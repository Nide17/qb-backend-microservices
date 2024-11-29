// Bring in Mongo
const mongoose = require('mongoose')
const slugify = require("slugify")

//initialize Mongo schema
const Schema = mongoose.Schema;

//create a schema object
const CategorySchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  quizes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Quiz'
    }
  ],
  created_by: {
    type: Schema.Types.ObjectId,
  },
  last_updated_by: {
    type: Schema.Types.ObjectId,
  },
  courseCategory: {
    type: Schema.Types.ObjectId,
  },
  slug: {
    type: String,
    required: true,
  },
}, { timestamps: true })

CategorySchema.pre("validate", function (next) {
  const category = this

  if (category.title) {
    category.slug = slugify(`${category.title}`, { replacement: '-', lower: true, strict: true })
  }
  next()
})

CategorySchema.methods.populateCourseCategory = async function () {

  const axios = require('axios');
  let category = this;
  const courseCategory = await axios.get(`${process.env.API_GATEWAY_URL}/api/course-categories/${category.courseCategory}`);

  category = category.toObject();
  category.courseCategory = courseCategory && { _id: courseCategory._id, title: courseCategory.title };
  return category;
};

module.exports = mongoose.model("Category", CategorySchema);