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
}, { timestamps: true })

UserSchema.methods.populateSchoolData = async function () {
  let user = this;
  const axios = require('axios');

  try {
    const [schl, level, faculty] = await Promise.all([
      user.school ? axios.get(`${process.env.API_GATEWAY_URL}/api/schools/${user.school}`).catch(() => null) : null,
      user.level ? axios.get(`${process.env.API_GATEWAY_URL}/api/levels/${user.level}`).catch(() => null) : null,
      user.faculty ? axios.get(`${process.env.API_GATEWAY_URL}/api/faculties/${user.faculty}`).catch(() => null) : null
    ]);

    user = user.toObject();
    user.school = schl ? { _id: schl.data._id, title: schl.data.title } : null;
    user.level = level ? { _id: level.data._id, title: level.data.title } : null;
    user.faculty = faculty ? { _id: faculty.data._id, title: faculty.data.title } : null;
  } catch (error) {
    console.error('Error populating school data:', error);
  }

  return user;
};

module.exports = mongoose.model("User", UserSchema);
