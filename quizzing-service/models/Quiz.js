// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")

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
  },
  last_updated_by: {
    type: Schema.Types.ObjectId,
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
}, { timestamps: true })

QuizSchema.pre("validate", function (next) {
  const quiz = this

  if (quiz.title) {
    quiz.slug = slugify(`${quiz.title}`, { replacement: '-', lower: true, strict: true })
  }
  next()
})

module.exports = mongoose.model("Quiz", QuizSchema);