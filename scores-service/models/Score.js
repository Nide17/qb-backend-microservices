// Bring in Mongo
const mongoose = require('mongoose');
const dbScores = require('../utils/db');

//initialize Mongo schema
const Schema = mongoose.Schema;

// The alternative to the export model pattern is the export schema pattern.
const ScoreSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    marks: {
        type: Number,
        required: true
    },
    out_of: {
        type: Number,
        required: true
    },
    test_date: {
        type: Date,
        default: Date.now
    },
    review: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        questions: [
            {
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
                            },
                            choosen: {
                                type: Boolean,
                                required: true,
                                default: false
                            }
                        }
                    ]
                }
            }
        ]

    },
    category: {
        type: Schema.Types.ObjectId,
    },
    quiz: {
        type: Schema.Types.ObjectId,
    },
    taken_by: {
        type: Schema.Types.ObjectId,
    }
});

ScoreSchema.methods.populateQuizDetails = async function () {

    let score = this;
    const axios = require('axios');
    try {
        const catg = score.category && await axios.get(`${process.env.API_GATEWAY_URL}/api/categories/${score.category}`);
        const qz = score.quiz && await axios.get(`${process.env.API_GATEWAY_URL}/api/quizzes/${score.quiz}`);
        const usr = score.taken_by && await axios.get(`${process.env.API_GATEWAY_URL}/api/users/${score.taken_by}`);

        score = score.toObject();
        score.category = catg && { _id: catg.data._id, title: catg.data.title };
        score.quiz = qz && { _id: qz.data._id, title: qz.data.title };
        score.taken_by = usr && { _id: usr.data._id, role: usr.data.role, name: usr.data.name, email: usr.data.email };
    } catch (error) {
        console.error('Error fetching details:', error);
    }

    return score;
};


//create a model
const Score = dbScores.model('Score', ScoreSchema);
module.exports = Score;