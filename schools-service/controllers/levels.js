const Level = require("../models/Level");
const Faculty = require("../models/Faculty");
const { handleError } = require('../utils/error');

// Helper function to find level by ID
const findLevelById = async (id, res, selectFields = '') => {
    try {
        const level = await Level.findById(id).select(selectFields).populate('school');
        if (!level) return res.status(404).json({ msg: 'No level found!' });
        return level;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getLevels = async (req, res) => {

    try {
        const levels = await Level.find().sort({ createdAt: -1 }).populate('school');
        res.status(200).json(levels);
    } catch (err) {
        handleError(res, err);
    }

};

exports.getLevelsBySchool = async (req, res) => {
    try {
        const levels = await Level.find({ school: req.params.id }).sort({ createdAt: -1 }).populate('school');
        res.status(200).json(levels);
    } catch (err) {
        handleError(res, err);
    }
}

exports.getOneLevel = async (req, res) => {
    const level = await findLevelById(req.params.id, res, '-__v');
    if (level) res.status(200).json(level);
};

exports.createLevel = async (req, res) => {

    const { title, school } = req.body;

    // Simple validation
    if (!title || !school) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    try {
        const level = await Level.findOne({ title, school });
        if (level) throw Error('This level already exists in this school!');
        const newLevel = new Level({
            title,
            school
        });

        const savedLevel = await newLevel.save();
        if (!savedLevel) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedLevel._id,
            title: savedLevel.title,
            school: savedLevel.school,
            createdAt: savedLevel.createdAt,
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateLevel = async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ msg: 'Level not found!' });

        const updatedLevel = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedLevel);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteLevel = async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) throw Error('Level is not found!')

        // Delete faculties belonging to this level
        const remFaculty = await Faculty.deleteMany({ level: req.params.id });

        if (!remFaculty)
            throw Error('Something went wrong while deleting!');

        // Delete level
        const removedLevel = await Level.deleteOne({ _id: req.params.id });

        if (!removedLevel)
            throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: `${level.title} is Deleted!` })
    } catch (err) {
        handleError(res, err);
    }
};
