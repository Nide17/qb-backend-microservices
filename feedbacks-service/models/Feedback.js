// Bring in Mongo
const mongoose = require('mongoose');
const axios = require('axios');

//initialize Mongo schema
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: false
  },
  score: {
    type: Schema.Types.ObjectId
  },
  quiz: {
    type: Schema.Types.ObjectId
  }
}, { timestamps: true });

FeedbackSchema.methods.populateDetails = async function () {
    const feedback = this;
    const quiz = await axios.get(`${process.env.API_GATEWAY_URL}/quizzes/${feedback.quiz}`);
    const score = await axios.get(`${process.env.API_GATEWAY_URL}/scores/${feedback.score}`);
    const user = score && await axios.get(`${process.env.API_GATEWAY_URL}/users/${score.data.taken_by}`);

    feedback.quiz = quiz.data;
    feedback.score = score && {
        ...score.data,
        taken_by: user && user.data
    };
    return feedback;
};

module.exports = mongoose.model('Feedback', FeedbackSchema);