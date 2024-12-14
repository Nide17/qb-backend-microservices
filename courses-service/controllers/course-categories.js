const CourseCategory = require("../models/CourseCategory");
const Course = require("../models/Course");
const Chapter = require("../models/Chapter");
const Notes = require("../models/Notes");
const { handleError } = require('../utils/error');

// Helper function to find category by ID
const findCategoryById = async (id, res, selectFields = '') => {
    try {
        const category = await CourseCategory.findById(id).select(selectFields);
        if (!category) return res.status(404).json({ msg: 'No category found!' });
        return category;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getCategories = async (req, res) => {
    
    try {
        const categories = await CourseCategory.find().sort({ createdAt: -1 });
        if (!categories) throw Error('No course categories found!');
        res.status(200).json(categories);
    } catch (err) {
        console.log(err);
        handleError(res, err);
    }
};

exports.getOneCategory = async (req, res) => {
    const category = await findCategoryById(req.params.id, res);
    if (category) res.status(200).json(category);
};

exports.createCategory = async (req, res) => {
    const { title, description, created_by } = req.body;

    // Simple validation
    if (!title || !description) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    try {
        const category = await CourseCategory.findOne({ title });
        if (category) throw Error('Category already exists!');

        const newCategory = new CourseCategory({ title, description, created_by });
        const savedCategory = await newCategory.save();
        if (!savedCategory) throw Error('Something went wrong during creation!');

        res.status(200).json(savedCategory);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await findCategoryById(req.params.id, res);
        if (!category) return;

        const updatedCategory = await CourseCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedCategory);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await findCategoryById(req.params.id, res);
        if (!category) return;

        // Delete related data
        await Promise.all([
            Course.deleteMany({ category: category._id }),
            Chapter.deleteMany({ category: category._id }),
            Notes.deleteMany({ category: category._id })
        ]);

        const removedCategory = await CourseCategory.deleteOne();
        if (!removedCategory) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};
