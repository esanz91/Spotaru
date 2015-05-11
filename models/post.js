var mongoose = require('mongoose');

// post schema : schema maps to a MongoDB collection
var postSchema = new mongoose.Schema({
        address             : {
            formatted_address   : {type: String, required: true},
            route               : {type: String},
            neighborhood        : {type: String},
            city                : {type: String},
            county              : {type: String},
            state               : {type: String},
            zip_code            : {type: String},
            country             : {type: String},
            longitude           : {type: Number, required: true},
            latitude            : {type: Number, required: true}
        },
        aptDetails          : {
            bedrooms            : {type: Number, required: true},
            bathrooms           : {type: Number, required: true},
            sqft                : {type: Number},
            rent                : {type: Number, required: true}
        },
        extraDetails        : {
            pets                : {type: Boolean},
            amenities           : {
                dishwasher          : {type: Boolean},
                gym                 : {type: Boolean},
                elevator            : {type: Boolean}
            }
        },
        created: {type: Date, default: Date.now}
    },
    {versionKey: '_MongooseVersionKey'});

// create and export post model
module.exports = mongoose.model('Post', postSchema);