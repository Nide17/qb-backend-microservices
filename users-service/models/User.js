// Bring in Mongo
const mongoose = require('mongoose')

// Initialize Mongo schema
const Schema = mongoose.Schema

// Create a schema object
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'Visitor'
  },
  image: {
    type: String
  },
  school: {
    type: Schema.Types.ObjectId,
  },
  level: {
    type: Schema.Types.ObjectId,
  },
  faculty: {
    type: Schema.Types.ObjectId,
  },
  year: {
    type: String
  },
  interests: {
    type: [
      {
        favorite: {
          type: String,
        }
      }
    ]
  },
  about: {
    type: String
  },
  current_token: {
    type: String
  },
  otp: {
    type: String,
    default: '',
  },
  verified: {
    type: Boolean,
  },
}, { timestamps: true })

const User = mongoose.model("User", UserSchema);
module.exports = User