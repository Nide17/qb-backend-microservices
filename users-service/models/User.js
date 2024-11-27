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
    expires: 900  // 15 minutes
  },
  verified: {
    type: Boolean,
  },
}, { timestamps: true })

UserSchema.methods.populateSchoolData = async function () {
  const user = this;
  const schl = await axios.get(`${process.env.API_GATEWAY_URL}/api/schools/${user.school}`);
  const lvl = await axios.get(`${process.env.API_GATEWAY_URL}/api/levels/${user.level}`);
  const faculty = await axios.get(`${process.env.API_GATEWAY_URL}/api/levels/${faculty.level}`);

  user.school = schl.data;
  user.level = lvl.data;
  user.faculty = faculty.data;

  return user;
};

module.exports = mongoose.model("User", UserSchema);
