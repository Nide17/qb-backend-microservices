// Bring in Mongo
const mongoose = require('mongoose');
const axios = require('axios');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

// Initialize Mongo schema
const Schema = mongoose.Schema;

// ImageUpload Schema
const ImageUploadSchema = new Schema({
    imageTitle: {
        type: String,
        required: true,
    },
    uploadImage: String,
    owner: {
        type: Schema.Types.ObjectId
    }
}, { timestamps: true });

// Method to populate owner details
ImageUploadSchema.methods.populateOwner = async function () {
    let upload = this;
    let owner = null;

    if (upload.owner) {
        try {
            const response = await axios.get(`${API_GATEWAY_URL}/api/users/${upload.owner}`);
            owner = response.data;
        } catch (error) {
            console.error('Error fetching owner details:', error);
        }
    }

    upload = upload.toObject();
    upload.owner = owner ? { _id: owner._id, name: owner.name } : null;
    return upload;
};

module.exports = mongoose.model("ImageUpload", ImageUploadSchema);