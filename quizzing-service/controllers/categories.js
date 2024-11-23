const Category = require("../models/Category");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find category by ID
const findCategoryById = async (id, res, selectFields = '') => {
    try {
        const category = await Category.findById(id).select(selectFields);
        if (!category) return res.status(404).json({ msg: 'No category found!' });
        return category;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        if (!categories) return res.status(404).json({ msg: 'No categories found!' });
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
    
    const { title, description, quizes, created_by, creation_date, courseCategory } = req.body;

    if (!title || !description) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    try {
        const category = await Category.findOne({ title });
        if (category) throw Error('Category already exists!');

        const newCategory = new Category({
            title,
            description,
            creation_date,
            quizes,
            created_by,
            courseCategory
        });

        const savedCategory = await newCategory.save();
        if (!savedCategory) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedCategory._id,
            title: savedCategory.title,
            description: savedCategory.description,
            creation_date: savedCategory.creation_date,
            quizes: savedCategory.quizes,
            created_by: savedCategory.created_by,
            courseCategory: savedCategory.courseCategory,
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ msg: 'Category not found!' });

        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedCategory);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) throw Error('Category not found!');

        const removedCategory = await Category.deleteOne({ _id: req.params.id });
        if (removedCategory.deletedCount === 0) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};
