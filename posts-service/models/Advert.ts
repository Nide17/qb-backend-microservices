import mongoose, { Document, Schema, Model, model } from "mongoose";

// Bring in Mongo
;

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const AdvertSchema = new Schema({
    caption: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    advert_image: {
        type: String,
        required: true
    },
    status: { // Active, Inactive
        type: String,
        required: true,
        default: "Inactive"
    }
}, { timestamps: true });

module.exports = mongoose.model("Advert", AdvertSchema);