const Notes = require("../models/Notes");
const { handleError } = require('../utils/error');

// Helper function to find notes by ID
const findNotesById = async (id, res, selectFields = '') => {
    try {
        let notes = await Notes.findById(id).select(selectFields)
            .populate('course chapter courseCategory', 'title');
        if (!notes) return res.status(404).json({ message: 'No notes found!' });

        notes = await notes.populateQuizzes();
        return notes;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to find notes with optional limit
const findNotes = async (query, res, limit = 0) => {
    try {
        let notesQuery = Notes.find(query).sort({ createdAt: -1 })
            .select('title description notes_file chapter course courseCategory quizzes createdAt')
            .populate('course chapter courseCategory', 'title');
        if (limit > 0) notesQuery = notesQuery.limit(limit);
        let notes = await notesQuery;
        if (!notes) return res.status(204).json({ message: 'No notes found!' });

        notes = await Promise.all(notes.map(async (note) => {
            if (note.quizzes && note.quizzes.length > 0) {
                await note.populateQuizzes();
            }
            return note;
        }));
        return notes;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getNotes = async (req, res) => {
    const notes = await findNotes({}, res);
    if (notes) res.status(200).json(notes);
};

exports.getLimitedNotes = async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const notes = await findNotes({}, res, limit);
    if (notes) res.status(200).json(notes);
};

exports.getNotesByCategory = async (req, res) => {
    const notes = await findNotes({ courseCategory: req.params.id }, res);
    if (notes) res.status(200).json(notes);
};

exports.getNotesByChapter = async (req, res) => {
    const notes = await findNotes({ chapter: req.params.id }, res);
    if (notes) res.status(200).json(notes);
};

exports.getOneNotes = async (req, res) => {
    try {
        const id = req.params.id;
        const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

        let notes = await Notes.findOne(query)
            .select('title description notes_file chapter course courseCategory quizzes createdAt')
            .populate('course chapter courseCategory', 'title');
        if (!notes) return res.status(404).json({ message: 'No notes found!' });

        notes = await notes.populateQuizzes();
        res.status(200).json(notes);
    }
    catch (err) {
        handleError(res, err);
    }
}

exports.createNotes = async (req, res) => {
    const { title, description } = req.body;

    if (req.file) {
        const not_file = req.file;
        try {
            const note = await Notes.findOne({ _id: req.params.id });
            if (!note) return res.status(404).json({ message: 'Note not found' });

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
        if (!note) return res.status(404).json({ message: 'Notes not found!' });

        await Notes.updateOne(
            { _id: note._id },
            { $pull: { quizzes: req.body.quizID } }
        );

        res.status(200).json({ message: `Deleted!` });
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteNotes = async (req, res) => {
    try {
        const notes = await Notes.findById(req.params.id);
        if (!notes) return res.status(404).json({ message: 'Notes not found!' });

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

        // API Call to delete Download from downloads service
        const downloadServiceUrl = `${process.env.DOWNLOADS_SERVICE_URL}/api/downloads/by-notes/${notes._id}`;
        const response = await axios.delete(downloadServiceUrl);
        if (response.status !== 200) return res.status(500).json({ message: 'Could not delete download, try again!' });

        const removedNotes = await Notes.deleteOne({ _id: req.params.id });
        if (!removedNotes) return res.status(500).json({ message: 'Could not delete notes, try again!' });

        res.status(200).json({ message: `Deleted!` });
    } catch (err) {
        handleError(res, err);
    }
};
