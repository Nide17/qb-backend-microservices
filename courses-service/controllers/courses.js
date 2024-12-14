const Course = require("../models/Course");
const Chapter = require("../models/Chapter");
const Notes = require("../models/Notes");
const { handleError } = require('../utils/error');

// Helper function to find course by ID
const findCourseById = async (id, res, selectFields = '') => {
    try {
        const course = await Course.findById(id).select(selectFields);
        if (!course) return res.status(404).json({ msg: 'No course found!' });
        return course;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        if (!courses) throw Error('No courses found!');
        res.status(200).json(courses);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getCoursesByCategory = async (req, res) => {
    try {
        const courses = await Course.find({ courseCategory: req.params.id });
        res.status(200).json(courses);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneCourse = async (req, res) => {
    const course = await findCourseById(req.params.id, res);
    if (course) res.status(200).json(course);
};

exports.createCourse = async (req, res) => {
    const { title, description, courseCategory, created_by } = req.body;

    // Simple validation
    if (!title || !description || !courseCategory) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    try {
        const course = await Course.findOne({ title });
        if (course) throw Error('Course already exists!');

        const newCourse = new Course({
            title,
            description,
            courseCategory,
            created_by
        });

        const savedCourse = await newCourse.save();
        if (!savedCourse) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedCourse._id,
            title: savedCourse.title,
            description: savedCourse.description,
            courseCategory: savedCourse.courseCategory,
            created_by: savedCourse.created_by,
            createdAt: savedCourse.createdAt,
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await findCourseById(req.params.id, res);
        if (!course) return;

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedCourse);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) throw Error('Course is not found!');

        // Delete chapters belonging to this course
        const removedChapters = await Chapter.deleteMany({ course: course._id });
        if (!removedChapters) throw Error('Something went wrong while deleting the course chapters!');

        // Delete notes belonging to this chapter
        const removedNotes = await Notes.deleteMany({ course: course._id });
        if (!removedNotes) throw Error('Something went wrong while deleting the course notes!');

        // Delete this course
        const removedCourse = await Course.deleteOne({ _id: req.params.id });
        if (!removedCourse) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: `Deleted!` });
    } catch (err) {
        handleError(res, err);
    }
};
