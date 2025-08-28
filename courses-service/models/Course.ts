import mongoose, { Document, Schema, Model, model } from "mongoose";

// Bring in Mongo
;

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const CourseSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    courseCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    created_by: {
        type: Schema.Types.ObjectId,
    },
    last_updated_by: {
        type: Schema.Types.ObjectId,
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);