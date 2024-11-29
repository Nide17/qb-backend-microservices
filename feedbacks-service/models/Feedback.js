// Bring in Mongo
const mongoose = require('mongoose');

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

  const axios = require('axios');
  const feedback = this;
  const quiz = await axios.get(`${process.env.API_GATEWAY_URL}/api/quizzes/${feedback.quiz}`);
  const score = await axios.get(`${process.env.API_GATEWAY_URL}/api/scores/${feedback.score}`);
  const user = score && await axios.get(`${process.env.API_GATEWAY_URL}/api/users/${score.data.taken_by}`);

  feedback = feedback.toObject();
  feedback.quiz = quiz && { _id: quiz._id, title: quiz.title };
  feedback.score = score && {
    _id: score.data._id, marks: score.data.marks, out_of: score.data.out_of, category: score.data.category, quiz: score.data.quiz, taken_by: user && { _id: user._id, name: user.name }
  };

  return feedback;
};

module.exports = mongoose.model('Feedback', FeedbackSchema);