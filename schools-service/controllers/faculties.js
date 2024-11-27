const Faculty = require("../models/Faculty");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find faculty by ID
const findFacultyById = async (id, res, selectFields = '') => {
    try {
        const faculty = await Faculty.findById(id).select(selectFields).populate('School Level');
        if (!faculty) return res.status(404).json({ msg: 'No faculty found!' });
        return faculty;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getFaculties = async (req, res) => {

    try {
        const faculties = await Faculty.find().sort({ createdAt: -1 }).populate('School Level');
        res.status(200).json(faculties);
    } catch (err) {
        handleError(res, err);
    }

};

exports.getFacultiesByLevel = async (req, res) => {
    try {
        const faculties = await Faculty.find({ level: req.params.id }).sort({ createdAt: -1 }).populate('School Level');
        res.status(200).json(faculties);
    } catch (err) {
        handleError(res, err);
    }
}

exports.getOneFaculty = async (req, res) => {
    const faculty = await findFacultyById(req.params.id, res, '-__v');
    if (faculty) res.status(200).json(faculty);
};

exports.createFaculty = async (req, res) => {

    const { title, school, level, years } = req.body

    // Simple validation
    if (!title || !school || !level || !years) {
        return res.status(400).json({ msg: 'Please fill all fields' })
    }

    try {
        const faculty = await Faculty.findOne({ title, school, level })
        if (faculty) throw Error('Faculty already exists in this school level!')

        const newFaculty = new Faculty({
            title,
            school,
            level,
            years
        })

        const savedFaculty = await newFaculty.save()
        if (!savedFaculty) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedFaculty._id,
            title: savedFaculty.title,
            school: savedFaculty.school,
            level: savedFaculty.level,
            years: savedFaculty.level,
            createdAt: savedFaculty.createdAt
        })
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ msg: 'Faculty not found!' });

        const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedFaculty);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) throw Error('Faculty is not found!');

        const removedFaculty = await Faculty.deleteOne({ _id: req.params.id });
        if (!removedFaculty) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: `${faculty.title} is Deleted!` });
    } catch (err) {
        handleError(res, err);
    }
};
