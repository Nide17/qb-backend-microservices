// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")
const axios = require('axios')

//initialize Mongo schema
const Schema = mongoose.Schema

//BlogPost Schema
const BlogPostSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    postsCategory: {
        type: Schema.Types.ObjectId,
        ref: 'PostsCategory'
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
},
    {
        timestamps: true,
    })

BlogPostSchema.pre("validate", function (next) {
    const blogPost = this

    if (blogPost.title) {
        blogPost.slug = slugify(`${blogPost.title}`, { replacement: '-', lower: true, strict: true })
    }
    next()
})

BlogPostSchema.methods.populateCreator = async function () {
    const blogPost = this;
    const creator = await axios.get(`${process.env.API_GATEWAY_URL}/api/users/${blogPost.creator}`);
    blogPost.creator = creator.data;
    return blogPost;
};

module.exports = mongoose.model("BlogPost", BlogPostSchema)
