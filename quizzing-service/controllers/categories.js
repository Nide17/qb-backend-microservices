const Category = require("../models/Category");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find category by ID
const findCategoryById = async (id, res, selectFields = '') => {
    try {
        let category = await Category.findById(id).select(selectFields).populate('Quiz');
        if (!category) return res.status(404).json({ msg: 'No category found!' });

        if (category.courseCategory) {
            category = await category.populateCourseCategory();
        }

        return category;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to validate category data
const validateCategoryData = (data) => {
    const { title, description } = data;
    if (!title || !description) {
        throw new Error('Please fill all fields');
    }
};

// Helper function to check if category exists by title
const checkCategoryExists = async (title) => {
    const category = await Category.findOne({ title });
    if (category) throw new Error('Category already exists!');
};

exports.getCategories = async (req, res) => {
    try {
        let categories = await Category.find().sort({ createdAt: -1 }).populate('Quiz');
        if (!categories) return res.status(404).json({ msg: 'No categories found!' });

        categories = await Promise.all(categories.map(async (category) => await category.populateCourseCategory()));
        res.status(200).json(categories);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneCategory = async (req, res) => {
    const category = await findCategoryById(req.params.id, res);
    if (category) res.status(200).json(category);
};

exports.createCategory = async (req, res) => {
    try {
        validateCategoryData(req.body);
        await checkCategoryExists(req.body.title);

        const newCategory = new Category(req.body);
        const savedCategory = await newCategory.save();
        if (!savedCategory) throw new Error('Something went wrong during creation!');

        res.status(200).json(savedCategory);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await findCategoryById(req.params.id, res);
        if (!category) return;

        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedCategory);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await findCategoryById(req.params.id, res);
        if (!category) return;

        const removedCategory = await Category.deleteOne({ _id: req.params.id });
        if (removedCategory.deletedCount === 0) throw new Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};
