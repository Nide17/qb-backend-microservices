const { S3 } = require("@aws-sdk/client-s3");
const Advert = require("../models/Advert.js");

const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION
});

// Helper function to handle errors
const handleError = (res, err, status = 400) => {
    console.error(err);
    res.status(status).json({ msg: err.message });
};

// Helper function to find advert by ID
const findAdvertById = async (id, res, selectFields = '') => {
    try {
        const advert = await Advert.findById(id).select(selectFields);
        if (!advert) return res.status(404).json({ msg: 'No advert found!' });
        return advert;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to delete image from S3
const deleteImageFromS3 = async (imagePath) => {
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: imagePath.split('/').pop()
    };
    return s3Config.deleteObject(params).promise();
};

exports.getAdverts = async (req, res) => {
    try {
        const adverts = await Advert.find().sort({ createdAt: -1 });
        if (!adverts) return res.status(404).json({ msg: 'No adverts found!' });
        res.status(200).json(adverts);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneAdvert = async (req, res) => {
    const advert = await findAdvertById(req.params.id, res);
    if (advert) res.status(200).json(advert);
};

exports.getActiveAdverts = async (req, res) => {
    try {
        const adverts = await Advert.find({ status: 'Active' }).sort({ createdAt: -1 });
        if (!adverts) return res.status(404).json({ msg: 'No active adverts found!' });
        res.status(200).json(adverts);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getCreatedBy = async (req, res) => {
    try {
        const adverts = await Advert.find({ owner: req.params.id }).sort({ createdAt: -1 });
        if (!adverts) return res.status(404).json({ msg: 'No adverts found!' });
        res.status(200).json(adverts);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createAdvert = async (req, res) => {
    const { caption, phone, owner, email, link } = req.body;

    // Simple validation
    if (!caption || !owner || !email || !phone) {
        return res.status(400).json({ msg: 'Please fill required fields' });
    }

    if (!req.file) {
        return handleError(res, new Error('FILE_MISSING'));
    }

    const ad_file = req.file;

    try {
        const newAdvert = new Advert({
            caption,
            phone,
            owner,
            email,
            link,
            advert_image: ad_file.location ? ad_file.location : ad_file.path
        });

        const savedAdvert = await newAdvert.save();
        if (!savedAdvert) throw new Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedAdvert._id,
            caption: savedAdvert.caption,
            owner: savedAdvert.owner,
            phone: savedAdvert.phone,
            email: savedAdvert.email,
            link: savedAdvert.link,
            advert_image: savedAdvert.advert_image,
            createdAt: savedAdvert.createdAt
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateAdvert = async (req, res) => {
    try {
        const advert = await Advert.findById(req.params.id);
        if (!advert) return res.status(404).json({ msg: 'Advert not found!' });

        const updatedAdvert = await Advert.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedAdvert);
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateAdvertStatus = async (req, res) => {
    try {
        const advert = await Advert.findById(req.params.id);
        if (!advert) return res.status(404).json({ msg: 'Advert not found!' });

        const updatedAdvert = await Advert.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.status(200).json(updatedAdvert);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteAdvert = async (req, res) => {
    try {
        const advert = await Advert.findById(req.params.id);
        if (!advert) throw new Error('Advert not found!');

        if (advert.advert_image) {
            await deleteImageFromS3(advert.advert_image);
        }

        const removedAdvert = await Advert.deleteOne({ _id: req.params.id });
        if (!removedAdvert) throw new Error('Something went wrong while deleting!');

        res.status(200).json({ msg: `${removedAdvert.caption} is Deleted!` });
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteAdvertImage = async (req, res) => {
    try {
        const advert = await Advert.findById(req.params.id);
        if (!advert) return res.status(404).json({ msg: 'Advert not found!' });

        const updatedAdvert = await Advert.findByIdAndUpdate(req.params.id, { advert_image: '' }, { new: true });
        res.status(200).json(updatedAdvert);
    } catch (error) {
        handleError(res, error);
    }
};
