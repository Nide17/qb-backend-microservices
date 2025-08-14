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
  let feedback = this;

  try {
    const [quiz, score] = await Promise.all([
      feedback.quiz ? axios.get(`${process.env.API_GATEWAY_URL}/api/quizzes/${feedback.quiz}`) : null,
      feedback.score ? axios.get(`${process.env.API_GATEWAY_URL}/api/scores/${feedback.score}`) : null
    ]);

    const user = score?.data?.taken_by ? await axios.get(`${process.env.API_GATEWAY_URL}/api/users/${score.data.taken_by}`) : null;

    feedback = feedback.toObject();
    feedback.quiz = quiz ? { _id: quiz.data._id, title: quiz.data.title } : null;
    feedback.score = score?.data ? {
      _id: score.data._id,
      marks: score.data.marks,
      out_of: score.data.out_of,
      taken_by: user ? { _id: user.data._id, name: user.data.name } : null
    } : null;

    return feedback;
  } catch (error) {
    console.error('Error populating feedback details:', error);
    feedback = feedback.toObject();
    feedback.quiz = feedback.quiz ? { _id: feedback.quiz } : null;
    feedback.score = feedback.score ? { _id: feedback.score } : null;
    return feedback;
  }
};

module.exports = mongoose.model('Feedback', FeedbackSchema);