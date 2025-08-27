// Bring in Mongo
const mongoose = require('mongoose')
const axios = require('axios');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

// initialize Mongo schema 
const Schema = mongoose.Schema

// Create Schema for blogPostsView 
const BlogPostsViewSchema = new Schema({
    blogPost: {
        type: Schema.Types.ObjectId,
        ref: 'BlogPost'
    },
    viewer: {
        type: Schema.Types.ObjectId,
        required: false,
        default: null
    },
    device: {
        type: String,
        required: false,
        default: null
    },
    country: {
        type: String,
        required: false,
        default: null
    }
}, { timestamps: true, })

BlogPostsViewSchema.methods.populateViewer = async function () {
    let view = this;
    let viewer = null;

    if (view.viewer) {
        try {
            viewer = await axios.get(`${API_GATEWAY_URL}/api/users/${view.viewer}`);
        } catch (error) {
            viewer = null;
        }
    }

    view = view.toObject();
    view.viewer = viewer && viewer.data && { _id: viewer.data._id, name: viewer.data.name };
    return view;
};

module.exports = mongoose.model("BlogPostsView", BlogPostsViewSchema)