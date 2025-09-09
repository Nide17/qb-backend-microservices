const Chapter = require("../models/Chapter");
const Notes = require("../models/Notes");
const { handleError } = require('../utils/error');

// Helper function to find chapter by ID
const findChapterById = async (id, res, selectFields = '') => {
    try {
        const chapter = await Chapter.findById(id).select(selectFields).populate('course');
        if (!chapter) return res.status(404).json({ message: 'No chapter found!' });
        return chapter;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to validate chapter fields
const validateChapterFields = (fields) => {
    const { title, description, courseCategory, course } = fields;
    if (!title || !description || !courseCategory || !course) {
        return 'Please fill all fields';
    }
    return null;
};

exports.getChapters = async (req, res) => {
    try {
        const chapters = await Chapter.find().sort({ createdAt: -1 });
        if (!chapters) throw Error('No chapters found!');
        res.status(200).json(chapters);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getChaptersByCourse = async (req, res) => {
    try {
        const chapters = await Chapter.find({ course: req.params.id });
        res.status(200).json(chapters);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneChapter = async (req, res) => {
    const chapter = await findChapterById(req.params.id, res);
    if (chapter) res.status(200).json(chapter);
};

exports.createChapter = async (req, res) => {
    const validationError = validateChapterFields(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const { title, description, courseCategory, course, created_by } = req.body;
        const chapter = await Chapter.findOne({ title });
        if (chapter) throw Error('Chapter already exists!');

        const newChapter = new Chapter({
            title,
            description,
            courseCategory,
            course,
            created_by
        });

        const savedChapter = await newChapter.save();
        if (!savedChapter) throw Error('Something went wrong during creation!');

        res.status(200).json(savedChapter);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateChapter = async (req, res) => {
    try {
        const chapter = await findChapterById(req.params.id, res);
        if (!chapter) return;

        const updatedChapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedChapter);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteChapter = async (req, res) => {
    try {
        const chapter = await findChapterById(req.params.id, res);
        if (!chapter) return;

        // Delete notes belonging to this chapter
        const removedNotes = await Notes.deleteMany({ chapter: chapter._id });
        if (!removedNotes) throw Error('Something went wrong while deleting the chapter notes!');

        // Delete this chapter
        const removedChapter = await Chapter.deleteOne({ _id: req.params.id });
        if (!removedChapter) throw Error('Something went wrong while deleting this chapter!');

        res.status(200).json({ message: 'Chapter Deleted!' });
    } catch (err) {
        handleError(res, err);
    }
};
