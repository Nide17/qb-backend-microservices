const School = require("../models/School");
const Level = require("../models/Level");
const Faculty = require("../models/Faculty");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find school by ID
const findSchoolById = async (id, res, selectFields = '') => {
    try {
        const school = await School.findById(id).select(selectFields);
        if (!school) return res.status(404).json({ msg: 'No school found!' });
        return school;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to validate school data
const validateSchoolData = (data) => {
    const { title, location, website } = data;
    if (!title || !location || !website) {
        throw new Error('Please fill all fields');
    }
};

exports.getSchools = async (req, res) => {
    try {
        const schools = await School.find();
        res.status(200).json(schools);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneSchool = async (req, res) => {
    const school = await findSchoolById(req.params.id, res);
    if (school) res.status(200).json(school);
};

exports.createSchool = async (req, res) => {
    try {
        validateSchoolData(req.body);

        const { title, location, website } = req.body;
        const existingSchool = await School.findOne({ title });
        if (existingSchool) throw new Error('School already exists!');

        const newSchool = new School({ title, location, website });
        const savedSchool = await newSchool.save();
        if (!savedSchool) throw new Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedSchool._id,
            title: savedSchool.title,
            location: savedSchool.location,
            createdAt: savedSchool.createdAt,
            website: savedSchool.website
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateSchool = async (req, res) => {
    try {
        const school = await findSchoolById(req.params.id, res);
        if (!school) return;

        const updatedSchool = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedSchool);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteSchool = async (req, res) => {
    try {
        const schoolToDelete = await findSchoolById(req.params.id, res);
        if (!schoolToDelete) return;

        // Delete levels and faculties belonging to this School
        await Level.deleteMany({ school: schoolToDelete._id });
        await Faculty.deleteMany({ school: schoolToDelete._id });

        // Delete this school
        const removedSchool = await School.deleteOne({ _id: req.params.id });
        if (!removedSchool) throw new Error('Something went wrong while deleting!');

        res.status(200).json({ msg: `${schoolToDelete.title} is Deleted!` });
    } catch (err) {
        handleError(res, err);
    }
};
