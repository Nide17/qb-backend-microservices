// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

//initialize Mongo schema
const Schema = mongoose.Schema

//create a schema object
const QuizSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Question'
    }
  ],
  created_by: {
    type: Schema.Types.ObjectId,
    validate: {
      validator: mongoose.Types.ObjectId.isValid,
      message: props => `${props.value} is not a valid ObjectId`
    }
  },
  last_updated_by: {
    type: Schema.Types.ObjectId,
    validate: {
      validator: mongoose.Types.ObjectId.isValid,
      message: props => `${props.value} is not a valid ObjectId`
    }
  },
  creation_date: {
    type: Date,
    default: Date.now
  },
  slug: {
    type: String,
    required: true,
  },
  video_links: {
    type: [
      {
        vtitle: {
          type: String,
          required: true
        },
        vlink: {
          type: String,
          required: true
        }
      }
    ]
  }
})

QuizSchema.pre("validate", function (next) {
  const quiz = this

  if (quiz.title) {
    quiz.slug = slugify(`${quiz.title}`, { replacement: '-', lower: true, strict: true })
  }
  next()
})

QuizSchema.methods.populateCreatedBy = async function () {
  const axios = require('axios');
  let quiz = this;

  let user = null;
  if (quiz.created_by) {
    try {
      user = await axios.get(`${API_GATEWAY_URL}/api/users/${quiz.created_by}`);
    } catch (error) {
      console.error('Error fetching user:', error);
      user = null;
    }
  }
  
  quiz = quiz.toObject();
  quiz.created_by = user ? { _id: user.data._id, name: user.data.name } : null;
  return quiz;
}

QuizSchema.methods.populateLastUpdatedBy = async function () {
  const axios = require('axios');
  let quiz = this;

  let user = null;
  if (quiz.last_updated_by) {
    try {
      user = await axios.get(`${API_GATEWAY_URL}/api/users/${quiz.last_updated_by}`);
    } catch (error) {
      console.error('Error fetching user:', error);
      user = null;
    }
  }
  
  quiz = quiz.toObject();
  quiz.last_updated_by = user ? { _id: user.data._id, name: user.data.name } : null;
  return quiz;
}

module.exports = mongoose.model("Quiz", QuizSchema);