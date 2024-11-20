const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PswdResetTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // expires in 900 secs
    },
});

const PswdResetToken = mongoose.model('PswdResetToken', PswdResetTokenSchema)
module.exports = PswdResetToken