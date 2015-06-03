var request = require('request');
var listingModel = require('../models/listing');

function queryGoogleComponentsByType(type, components) {
    return components.filter(function (item) {
        return item.types.filter(function (addressType) {
                return addressType == type;
            }).length > 0;
    }).map(function (item) {
        return item.long_name
    });
}

exports.createListing = function (req, res) {
    "use strict";
    var address = req.body.postalAddress;
    var bedrooms = req.body.bedrooms;
    var bathrooms = req.body.bathrooms;
    var sqft = req.body.sqft;
    var rent = req.body.rent;
    var dogs = req.body.dogs || false;
    var cats = req.body.cats || false;
    var centralAir = req.body.centralAir || false;
    var dishwasher = req.body.dishwasher || false;
    var elevator = req.body.elevator || false;
    var gym = req.body.gym || false;
    var pool = req.body.pool || false;
    var washerDryer = req.body.washerDryer || false;

    console.log("ADDRESS:\n" + address);
    address = encodeURIComponent(address);
    console.log("ADDRESS ENCODED:\n" + address);

    request.post("http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=false", function (err, response, body) {
        if (!err && response.statusCode === 200) {
            var data = JSON.parse(body);
            var listingJSON = {
                address: {
                    formatted_address: data.results[0].formatted_address,
                    street_number: queryGoogleComponentsByType("street_number", data.results[0].address_components),
                    route: queryGoogleComponentsByType("route", data.results[0].address_components),
                    neighborhood: queryGoogleComponentsByType("neighborhood", data.results[0].address_components),
                    locality: queryGoogleComponentsByType("locality", data.results[0].address_components),
                    administrative_area_level_2: queryGoogleComponentsByType("administrative_area_level_2", data.results[0].address_components),
                    administrative_area_level_1: queryGoogleComponentsByType("administrative_area_level_1", data.results[0].address_components),
                    postal_code: queryGoogleComponentsByType("postal_code", data.results[0].address_components),
                    country: queryGoogleComponentsByType("country", data.results[0].address_components),
                    longitude: data.results[0].geometry.location.lng,
                    latitude: data.results[0].geometry.location.lat
                },
                aptDetails: {
                    bedrooms: bedrooms,
                    bathrooms: bathrooms,
                    sqft: sqft,
                    rent: rent
                },
                extraDetails: {
                    pets: {
                        dogs: dogs,
                        cats: cats
                    },
                    amenities: {
                        centralAir: centralAir,
                        dishwasher: dishwasher,
                        elevator: elevator,
                        gym: gym,
                        pool: pool,
                        washerDryer: washerDryer
                    }
                },
                creator: req.session.username
            };

            console.log("ListingJSON:\n" + listingJSON);

            var listing = new listingModel(listingJSON);
            listing.save(function (err, listing) {
                if (err) {
                    return res.render('msgs', {
                        msgs: "Error posting listing...",
                        user: {loggedout: !res.locals.loggedin, loggedin: res.locals.loggedin}
                    });
                }
                //Todo: render a better "listing" page
                return res.render('msgs', {
                    msgs: listing,
                    user: {loggedout: !res.locals.loggedin, loggedin: res.locals.loggedin}
                });
            });
        }
        else {
            //Todo: handle error better
            res.render('msgs', {
                msgs: "could not get geolocation",
                user: {
                    loggedout: !res.locals.loggedin,
                    loggedin: res.locals.loggedin
                }
            });
            console.log("could not get geolocation");
        }
    });
}

exports.getMarkers = function (req, res) {
    var address = req.query.postalAddress;

    request.post("http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=false", function (err, response, body) {
        if (!err && response.statusCode === 200) {
            var data = JSON.parse(body);
            var longitude = data.results[0].geometry.location.lng;
            var latitude = data.results[0].geometry.location.lat;
            var type = data.results[0].types[0];
            var fieldName = "address." + type;
            var value = queryGoogleComponentsByType(type, data.results[0].address_components);

            console.log("type: " + type);
            console.log("field name: " + fieldName);
            console.log("value: " + value);
            console.log("lng: " + longitude + ", lat:" + latitude);

            //var query = {};
            //query[fieldName] = value;
            //listingModel.find(query, 'address.longitude address.latitude', function (err, listings) {
            listingModel.find().where(fieldName, value).select('').lean().exec(function (err, listings) {

                // error
                if (err) {
                    return res.send({msg: "error"});
                }
                // listings not found
                if ((!listings) || (null === listings) || (listings.length == 0)) {
                    return res.send({msg: "no matches"});
                }
                // listings found
                if (listings) {
                    return res.json({msg: "match", locations: listings, focus: data.results[0].geometry.location});
                }
            });
        }
    });
}