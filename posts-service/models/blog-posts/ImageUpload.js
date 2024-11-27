// Bring in Mongo
const mongoose = require('mongoose')

//Initialize Mongo schema
const Schema = mongoose.Schema

//ImageUpload Schema
const ImageUploadSchema = new Schema({
    imageTitle: {
        type: String,
        required: true,
    },
    uploadImage: String,
    owner: {
        type: Schema.Types.ObjectId
    }
}, { timestamps: true, })

ImageUploadSchema.methods.populateOwner = async function () {
    const upload = this;
    const owner = await axios.get(`${process.env.API_GATEWAY_URL}/api/users/${upload.owner}`);
    upload.owner = owner.data;
    return upload;
};

module.exports = mongoose.model("ImageUpload", ImageUploadSchema)