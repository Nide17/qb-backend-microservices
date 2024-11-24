const Notes = require("../models/Notes");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find notes by ID
const findNotesById = async (id, res, selectFields = '') => {
    try {
        const notes = await Notes.findById(id).select(selectFields);
        if (!notes) return res.status(404).json({ msg: 'No notes found!' });
        return notes;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getNotes = async (req, res) => {
    try {
        const notes = await Notes.find().sort({ createdAt: -1 });
        if (!notes) throw Error('No notes found!');
        res.status(200).json(notes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getLimitedNotes = async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    try {
        const notes = await Notes.find().sort({ createdAt: -1 }).limit(limit);
        if (!notes) throw Error('No notes found!');
        res.status(200).json(notes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getNotesByCategory = async (req, res) => {
    try {
        const notes = await Notes.find({ courseCategory: req.params.id });
        res.status(200).json(notes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getNotesByChapter = async (req, res) => {
    try {
        const notes = await Notes.find({ chapter: req.params.id });
        res.status(200).json(notes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneNotes = async (req, res) => {
    const notes = await findNotesById(req.params.id, res);
    if (notes) res.status(200).json(notes);
};

exports.createNotes = async (req, res) => {
    const { title, description } = req.body;

    if (req.file) {
        const not_file = req.file;
        try {
            const note = await Notes.findOne({ _id: req.params.id });
            if (!note) throw Error('Failed! note not exists!');

            const params = {
                Bucket: process.env.S3_BUCKET || config.get('S3Bucket'),
                Key: note.notes_file.split('/').pop()
            };

            s3Config.deleteObject(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log(params.Key + ' notes deleted!');
                }
            });

            const updatedNotes = await Notes.findByIdAndUpdate(
                { _id: req.params.id },
                { title, description, notes_file: not_file.location },
                { new: true }
            );

            res.status(200).json(updatedNotes);
        } catch (err) {
            handleError(res, err);
        }
    } else {
        try {
            const notes = await Notes.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
            res.status(200).json(notes);
        } catch (err) {
            handleError(res, err);
        }
    }
};

exports.updateNotes = async (req, res) => {
    try {
        const notes = await findNotesById(req.params.id, res);
        if (!notes) return;

        const updatedNotes = await Notes.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedNotes);
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateNotesQuizzes = async (req, res) => {
    try {
        const notes = await Notes.updateOne(
            { "_id": req.params.id },
            { $push: { "quizzes": req.body.quizesState } },
            { new: true }
        );
        res.status(200).json(notes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.removeQuizFromNotes = async (req, res) => {
    try {
        const note = await Notes.findOne({ _id: req.params.id });
        if (!note) throw Error('Notes not found!');

        await Notes.updateOne(
            { _id: note._id },
            { $pull: { quizzes: req.body.quizID } }
        );

        res.status(200).json({ msg: `Deleted!` });
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteNotes = async (req, res) => {
    try {
        const notes = await Notes.findById(req.params.id);
        if (!notes) throw Error('Notes not found!');

        const params = {
            Bucket: process.env.S3_BUCKET || config.get('S3Bucket'),
            Key: notes.notes_file.split('/').pop()
        };

        s3Config.deleteObject(params, (err, data) => {
            if (err) {
                handleError(res, err);
                console.log(err, err.stack);
            } else {
                console.log(params.Key + ' deleted from ' + params.Bucket);
            }
        });

        const removedDownloads = await Download.deleteMany({ notes: notes._id });
        if (!removedDownloads) throw Error('Something went wrong while deleting the downloads!');

        const removedNotes = await Notes.deleteOne({ _id: req.params.id });
        if (!removedNotes) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: `Deleted!` });
    } catch (err) {
        handleError(res, err);
    }
};
