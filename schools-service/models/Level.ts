import mongoose, { Document, Schema, Model, model } from "mongoose";

// Bring in Mongo
;

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const LevelSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School'
    }
}, { timestamps: true });

module.exports = mongoose.model('Level', LevelSchema);