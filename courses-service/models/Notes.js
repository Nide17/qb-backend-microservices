// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")

//initialize Mongo schema
const Schema = mongoose.Schema

//create a schema object
const NotesSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    notes_file: String,
    chapter: {
        type: Schema.Types.ObjectId,
        ref: 'Chapter'
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    courseCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    uploaded_by: {
        type: Schema.Types.ObjectId,
    },
    quizzes: [
        {
            type: Schema.Types.ObjectId,
            default: []
        }
    ]
}, { timestamps: true });

NotesSchema.pre("validate", function (next) {
    const notes = this

    if (notes.title) {
        notes.slug = slugify(`${notes.title}`, { replacement: '-', lower: true, strict: true })
    }
    next()
})

NotesSchema.methods.populateQuizzes = async function () {

    const axios = require('axios');
    const notes = this;
    const quizzes = await Promise.all(
        notes.quizzes.map(async (quizId) => {
            const quiz = await axios.get(`${process.env.API_GATEWAY_URL}/api/quizzes/${quizId}`);
            return quiz.data;
        })
    );

    notes = notes.toObject();
    notes.quizzes = quizzes && quizzes.map(quiz => ({ _id: quiz._id, title: quiz.title }));
    return notes;
};

module.exports = mongoose.model('Notes', NotesSchema);