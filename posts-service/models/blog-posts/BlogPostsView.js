// Bring in Mongo
const mongoose = require('mongoose')

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

module.exports = mongoose.model("BlogPostsView", BlogPostsViewSchema)