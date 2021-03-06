var map;
var markerList;
var infoWindow;
var bounds;
var username;

function requestListings() {
    //TODO: create a common class for the all following elements and retrieve with getElementsByClassName to condense code!
    var postalAddress = document.getElementById("postalAddress") || null;
    var minBedrooms = document.getElementById("minBedrooms") || null;
    var maxBedrooms = document.getElementById("maxBedrooms") || null;
    var minBathrooms = document.getElementById("minBathrooms") || null;
    var maxBathrooms = document.getElementById("maxBathrooms") || null;
    var minRent = document.getElementById("minRent")|| null;
    var maxRent = document.getElementById("maxRent")|| null;
    var sqft = document.getElementById("sqft")|| null;
    var filters = [ postalAddress, minBedrooms, maxBedrooms, minBathrooms, maxBathrooms, minRent, maxRent, sqft]; //apartment details

    // check if address provided
    if (postalAddress === null || postalAddress.value.length == 0){
        console.log("No specific location found");
        return;
    }

    // create request
    var request = createRequest();
    if (null === request) {
        console.log("Could not create request");
        return;
    }

    // add range values to URL
    var url = "/listings?";
    for(var i=0; i < filters.length; i++){
        if(filters[i].value != null && (filters[i].value.length > 0)){
            if(filters[i].value === "any"){
                continue;
            }
            var urlParam = encodeURIComponent(filters[i].value);
            url += filters[i].id + "=" + urlParam + "&";
        }
    }

    // add checkbox values to URL
    var checkboxFilters = document.querySelectorAll(".pet-checkbox, .amenities-checkbox");
    for(var i=0; i < checkboxFilters.length; i++){
        if(checkboxFilters[i].checked ==true){
            var urlParam = encodeURIComponent(true);
            url += checkboxFilters[i].id + "=" + urlParam + "&";
        }
    }

    if(url.charAt(url.length-1) === "&"){
        url = url.substr(0,url.length-1);
    }

    console.log("URL query: " + url);
    
    request.onreadystatechange = function () {
        getListings();
    };
    request.open("GET", url, true);
    request.send(null);
}

function getListings() {
    if (request.readyState == 4) {
        //TODO: handle other status codes
        if (request.status == 200) {
            var response = JSON.parse(request.responseText);
            if (response.msg == "no matches") {
                console.log("no matches!");
                setAllMap(null);
            }
            if (response.msg == "match") {
                console.log(response.listings);
                console.log("# search results: " + response.listings.length);

                // Remove previous markers from map and bounds
                setAllMap(null);
                bounds = new google.maps.LatLngBounds();

                // Create list of new markers
                for (var i = 0; i < response.listings.length; i++) {
                    addMarker(response.listings[i]);
                }

                // Add new markers to map
                setAllMap(map);

                // Don't zoom in too far on only one marker
                if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
                    var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
                    var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
                    bounds.extend(extendPoint1);
                    bounds.extend(extendPoint2);
                }

                map.fitBounds(bounds);
            }
        }
    }
}

// Set markers on map
function setAllMap(map) {
    for (var i = 0; i < markerList.length; i++) {
        markerList[i].setMap(map);
    }
    if (null === map) {
        markerList.length = 0;
        markerList = [];
    }
}

// Add marker to map
function addMarker(markerLocation) {

    var textInfo;
    var iwContent;
    var numBed = markerLocation.aptDetails.bedrooms;
    var numBath = markerLocation.aptDetails.bathrooms;
    var pt = new google.maps.LatLng(markerLocation.address.latitude, markerLocation.address.longitude);
    bounds.extend(pt);

    // add marker
    var marker = new google.maps.Marker({
        position: pt,
        map: map
    });
    markerList.push(marker);

    // define info window
    //studio
    if (numBed == 0) {
        textInfo = '<h4 class="text-info">$' + markerLocation.aptDetails.rent + ' <small>| Studio</small></h4>';
    }
    // apts
    else {
        textInfo = '<h4 class="text-info">$' + markerLocation.aptDetails.rent + ' <small>| ' + numBed + 'bd/' + numBath + 'ba</small></h4>';
    }

    iwContent = '<div>' +
        '<div>' +
        textInfo +
        '<div>' +
        '' +
        '</div>' +
        '<address class="text-info">' + markerLocation.address.street_number + ' ' + markerLocation.address.route + '</address>';
    '</div>';

    // add window info
    google.maps.event.addListener(marker, 'click', function () {

        // get apt info
        addApartmentInfo(markerLocation);

        // display apt info
        $("#filter-content-div").hide();
        $('#map-canvas').removeClass("content-75-width");
        $('#map-canvas').addClass("content-65-width");
        $("#search-content").show();

        // display marker for apt
        infoWindow.setContent(iwContent);
        infoWindow.open(map, marker);
    });
}

function addApartmentInfo(markerLocation) {

    var id = markerLocation._id;

    var resultMsg = document.getElementById("result-msg");
    var resultState = document.getElementById("result-state");
    var resultCity = document.getElementById("result-city");
    var resultAddress = document.getElementById("listing-address");
    var resultRent = document.getElementById("listing-rent");
    var listingDetail = document.getElementById("listing-detail");
    var listingId = document.getElementById("listing-id");

    showMsg(listingId, true, id);
    showMsg(resultState, true, markerLocation.address.administrative_area_level_1);
    showMsg(resultCity, true, markerLocation.address.locality);
    showMsg(resultAddress, true, markerLocation.address.formatted_address);
    showMsg(resultRent, true, "$" + markerLocation.aptDetails.rent);
    showMsg(resultMsg, true, "apartment info");
    showMsg(listingDetail, true, markerLocation.aptDetails.bedrooms + " bed/" + markerLocation.aptDetails.bathrooms + " bath");

    requestUserFavorites("GET", traverseUserFavorites);
    //TODO: create displayAddtnlDetails function
}

function createMap() {
    var map;

    //info window
    infoWindow = new google.maps.InfoWindow();

    // list to hold all markers of map
    markerList = new Array();

    // map style
    var styles = [
        {
            stylers: [
                {hue: "#104BA9"/*"#37766B"*/},
                {saturation: -50}
            ]
        }, {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [
                {lightness: 100},
                {visibility: "simplified"}
            ]
        }, {
            featureType: "road",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ]
        }
    ];

    // map options
    var mapOptions = {
        center: new google.maps.LatLng(40.767091, -73.975810),
        zoom: 8
        //styles: styles
    }

    // run only if map div found
    if (document.getElementById("map-canvas")) {
        showMap(mapOptions);

        // run only if search button found
        if (document.getElementById("search-button")) {
            document.getElementById("search-button").onclick = requestListings;
        }
    }
}

function showMap(mapOptions) {
    // create a new map inside of the given HTML container with the given map option, if any
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // geolocation API centers around a new property on the global navigator object: navigator.geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);
            map.setZoom(14);
        });
    }
}

function getLatLong(address, callback) {

    var geo = new google.maps.Geocoder;

    geo.geocode({'address': address}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            console.log("geo: " + JSON.stringify(results[0].geometry.location));
            callback(JSON.stringify(results[0].geometry.location));
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

