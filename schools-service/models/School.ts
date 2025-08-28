import mongoose, { Document, Schema, Model, model } from "mongoose";

// Bring in Mongo
;

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const SchoolSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);
