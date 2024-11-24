const Download = require("../models/Download");
const axios = require('axios');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to fetch related data for a download
const fetchDownloadDetails = async (download) => {

    const notes = await axios.get(`${API_GATEWAY_URL}/notes/${download.notes}`);
    const course = await axios.get(`${API_GATEWAY_URL}/courses/${download.course}`);
    const chapter = await axios.get(`${API_GATEWAY_URL}/chapters/${download.chapter}`);
    const user = await axios.get(`${API_GATEWAY_URL}/users/${download.downloaded_by}`);

    return {
        ...download.toObject(),
        notes: notes.data,
        course: course.data,
        chapter: chapter.data,
        downloaded_by: user.data
    };
};

exports.getDownloads = async (req, res) => {

    // Pagination
    const totalPages = await Download.countDocuments({});
    var PAGE_SIZE = 20;
    var pageNo = parseInt(req.query.pageNo || "0");
    var query = {};

    query.limit = PAGE_SIZE;
    query.skip = PAGE_SIZE * (pageNo - 1);

    try {
        const downloads = pageNo > 0 ?
            await Download.find({}, {}, query).sort({ createdAt: -1 }) :
            await Download.find().sort({ createdAt: -1 });

        if (!downloads) throw Error('No downloads exist');

        const result = await Promise.all(downloads.map(fetchDownloadDetails));

        if (pageNo > 0) {
            return res.status(200).json({
                totalPages: Math.ceil(totalPages / PAGE_SIZE),
                downloads: result
            });
        } else {
            return res.status(200).json({ downloads: result });
        }

    } catch (err) {
        handleError(res, err);
    }
};

exports.getDownloadsForNotesCreator = async (req, res) => {
    try {
        const downloads = await Download.find({});
        const result = await Promise.all(downloads.map(async (download) => {
            const details = await fetchDownloadDetails(download);
            return {
                updatedAt: download.updatedAt,
                notes_downloads_title: details.notes.title,
                courses_downloads_title: details.course.title,
                chapters_downloads_title: details.chapter.title,
                users_downloads_name: details.downloaded_by.name,
            };
        }));

        res.status(200).json(result);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getDownloadsByUser = async (req, res) => {

    try {
        const downloads = await Download.find({ downloaded_by: req.params.id });

        if (!downloads) throw Error('No downloads found!');

        const result = await Promise.all(downloads.map(fetchDownloadDetails));

        res.status(200).json(result);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createDownload = async (req, res) => {

    const { notes, chapter, course, courseCategory, downloaded_by } = req.body;
    var now = new Date();

    // Simple validation
    if (!notes || !course || !courseCategory || !downloaded_by) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    } else {
        try {
            const recentDownExist = await Download.find({ downloaded_by }, {}, { sort: { 'createdAt': -1 } });

            if (recentDownExist.length > 0) {
                let downDate = new Date(recentDownExist[0].createdAt);
                let seconds = Math.round((now - downDate) / 1000);

                if (seconds < 5) {
                    return res.status(400).json({
                        msg: 'Download with same time saved already!'
                    });
                }
            }

            const newDownload = new Download({
                notes,
                chapter,
                course,
                courseCategory,
                downloaded_by
            });

            const savedDownload = await newDownload.save();
            if (!savedDownload) throw Error('Something went wrong during creation!');

            res.status(200).json({
                _id: savedDownload._id,
                notes: savedDownload.notes,
                chapter: savedDownload.chapter,
                course: savedDownload.course,
                courseCategory: savedDownload.course,
                downloaded_by: savedDownload.downloaded_by
            });
        } catch (err) {
            handleError(res, err);
        }
    }
};

exports.deleteDownload = async (req, res) => {
    try {
        const download = await Download.findById(req.params.id);
        if (!download) throw Error('Download not found!');

        const removedDownload = await Download.deleteOne({ _id: req.params.id });
        if (removedDownload.deletedCount === 0) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};
