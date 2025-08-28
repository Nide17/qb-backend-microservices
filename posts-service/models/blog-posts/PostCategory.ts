import mongoose, { Document, Schema, Model, model } from "mongoose";

// Bring in Mongo
;

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const PostCategorySchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId
    }
}, { timestamps: true });

module.exports = mongoose.model('PostCategory', PostCategorySchema);