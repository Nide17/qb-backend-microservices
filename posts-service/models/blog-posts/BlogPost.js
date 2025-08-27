// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")
const axios = require('axios');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

const Schema = mongoose.Schema

//BlogPost Schema
const BlogPostSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    postCategory: {
        type: Schema.Types.ObjectId,
        ref: 'PostCategory'
    },
    post_image: String,
    markdown: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    creator: {
        type: Schema.Types.ObjectId,
    },
    bgColor: {
        type: String,
        required: true,
        default: '#f3f3f2'
    },
}, { timestamps: true, })

BlogPostSchema.pre("validate", function (next) {
    const blogPost = this

    if (blogPost.title) {
        blogPost.slug = slugify(`${blogPost.title}`, { replacement: '-', lower: true, strict: true })
    }
    next()
})

BlogPostSchema.methods.populateCreator = async function () {
    let blogPost = this;
    let creator = null;

    if (blogPost.creator) {
        try {
            creator = await axios.get(`${API_GATEWAY_URL}/api/users/${blogPost.creator}`);
        } catch (error) {
            console.error('Error fetching creator:', error.message);
            creator = null;
        }
    }

    blogPost = blogPost.toObject();
    blogPost.creator = creator && creator.data && { _id: creator.data._id, name: creator.data.name };
    return blogPost;
};

module.exports = mongoose.model("BlogPost", BlogPostSchema)
