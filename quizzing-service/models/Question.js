// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const QuestionSchema = new Schema({
    questionText: {
        type: String,
        required: true
    },
    question_image: String,
    answerOptions: {
        type: [
            {
                answerText: {
                    type: String,
                    required: true
                },
                explanations: {
                    type: String,
                    required: false,
                    default: null
                },
                isCorrect: {
                    type: Boolean,
                    required: true,
                    default: false
                }
            }
        ]
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    created_by: {
        type: Schema.Types.ObjectId,
    },
    last_updated_by: {
        type: Schema.Types.ObjectId,
    },
    duration: {
        type: Number,
        required: true,
        default: 40
    },
    slug: {
        type: String,
        required: true,
    },
}, { timestamps: true })

QuestionSchema.pre("validate", function (next) {
    const question = this

    if (question.questionText) {
        question.slug = slugify(`${question.questionText}`, { replacement: '-', lower: true, strict: true })
    }
    next()
})

module.exports = mongoose.model("Question", QuestionSchema);