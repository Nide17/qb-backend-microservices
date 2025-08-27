// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")
const axios = require('axios');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

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
        ref: 'CourseCategory'
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

    let notes = this;

    const quizzes = await Promise.all(
        notes.quizzes.map(async (quizId) => {
            try {
                const quiz = quizId ? await axios.get(`${API_GATEWAY_URL}/api/quizzes/${quizId}`) : null;
                return quiz ? quiz.data : null;
            } catch (error) {
                return null;
            }
        })
    );

    notes = notes.toObject();
    notes.quizzes = quizzes ? quizzes.map(quiz => quiz ? ({ _id: quiz._id, title: quiz.title }) : null) : null;
    return notes;
};

module.exports = mongoose.model('Notes', NotesSchema);