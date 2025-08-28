import mongoose, { Document, Schema, Model, model } from "mongoose";

// Bring in Mongo
;

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const QuizCommentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
    },
    quiz: {
        type: Schema.Types.ObjectId,
    }
}, { timestamps: true });

module.exports = mongoose.model('QuizComment', QuizCommentSchema);