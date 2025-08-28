import mongoose, { Document, Schema, Model, model } from "mongoose";
import * as axios from 'axios';

// Bring in Mongo

;
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

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
    default: ''
  },
  otpExpires: {
    type: Date,
    default: Date.now,
    expires: 900  // 15 minutes
  },
  verified: {
    type: Boolean,
    default: false
  },
  register_date: {
    type: Date,
    default: Date.now
  }
})

UserSchema.methods.populateSchoolData = async function () {

  let user = this;

  try {
    const [schl, level, faculty] = await Promise.all([
      user.school ? axios.get(`${API_GATEWAY_URL}/api/schools/${user.school}`) : null,
      user.level ? axios.get(`${API_GATEWAY_URL}/api/levels/${user.level}`) : null,
      user.faculty ? axios.get(`${API_GATEWAY_URL}/api/faculties/${user.faculty}`) : null
    ]);

    user = user.toObject();
    user.school = schl ? { _id: schl.data._id, title: schl.data.title } : null;
    user.level = level ? { _id: level.data._id, title: level.data.title } : null;
    user.faculty = faculty ? { _id: faculty.data._id, title: faculty.data.title } : null;

    return user;
    
  } catch (error) {
    console.error('Error populating school data:', error);
    user = user.toObject();
    user.school = user.school ? { _id: user.school } : null;
    user.level = user.level ? { _id: user.level } : null;
    user.faculty = user.faculty ? { _id: user.faculty } : null;

    return user;
  }

  return user;
};

module.exports = mongoose.model("User", UserSchema);
