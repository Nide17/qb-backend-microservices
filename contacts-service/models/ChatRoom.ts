import mongoose, { Document, Schema, Model, model } from "mongoose";

// Bring in Mongo
;

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const ChatRoomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    users: [{ type: Schema.Types.ObjectId, }]
}, { timestamps: true });

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);