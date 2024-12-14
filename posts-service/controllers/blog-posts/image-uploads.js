const ImageUpload = require("../../models/blog-posts/ImageUpload");
const { handleError } = require('../../utils/error');

// Helper function to find imageUpload by ID
const findImageUploadById = async (id, res, selectFields = '') => {
    try {
        let imageUpload = await ImageUpload.findById(id).select(selectFields);
        if (!imageUpload) return res.status(404).json({ msg: 'No imageUpload found!' });

        imageUpload = await imageUpload.populateOwner();
        return imageUpload;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getImageUploads = async (req, res) => {
    try {
        let imageUploads = await ImageUpload.find().sort({ createdAt: -1 });
        if (!imageUploads) return res.status(404).json({ msg: 'No imageUploads found!' });

        imageUploads = await Promise.all(imageUploads.map(async (imgUp) => await imgUp.populateOwner()));
        res.status(200).json(imageUploads);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneImageUpload = async (req, res) => {
    const imageUpload = await findImageUploadById(req.params.id, res);
    if (imageUpload) res.status(200).json(imageUpload);
};

exports.getImageUploadsByOwner = async (req, res) => {
    try {
        let imageUploads = await ImageUpload.find({ owner: req.params.id }).sort({ createdAt: -1 });
        if (!imageUploads) return res.status(404).json({ msg: 'No imageUploads found!' });

        imageUploads = await Promise.all(imageUploads.map(async (imgUp) => await imgUp.populateOwner()));

        res.status(200).json(imageUploads);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createImageUpload = async (req, res) => {
    const { imageTitle, owner } = req.body;

    // Simple validation
    if (!imageTitle || !owner) {
        return res.status(400).json({ msg: 'Image title and owner are required' });
    }

    if (!req.file) {
        return handleError(res, new Error('FILE_MISSING'));
    }

    const imgUp_file = req.file;

    try {
        const imgUp = await ImageUpload.findOne({ imageTitle });
        if (imgUp) return handleError(res, new Error('Failed! Image with that name already exists!'));

        const newImgUp = new ImageUpload({
            imageTitle,
            uploadImage: imgUp_file.location,
            owner
        });

        const savedImgUp = await newImgUp.save();
        if (!savedImgUp) return handleError(res, new Error('Something went wrong during creation! file size should not exceed 1MB'));

        res.status(200).json({
            _id: savedImgUp._id,
            imageTitle: savedImgUp.imageTitle,
            uploadImage: savedImgUp.uploadImage,
            owner: savedImgUp.owner,
            createdAt: savedImgUp.createdAt,
        });

    } catch (err) {
        handleError(res, err);
    }
};

exports.updateImageUpload = async (req, res) => {
    try {
        const imageUpload = await ImageUpload.findById(req.params.id);
        if (!imageUpload) return res.status(404).json({ msg: 'ImageUpload not found!' });

        const updatedImageUpload = await ImageUpload.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedImageUpload);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteImageUpload = async (req, res) => {

    try {
        const imageUpload = await ImageUpload.findById(req.params.id)
        if (!imageUpload) throw Error('Image upload is not found!')

        if (imageUpload.uploadImage) {
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: imageUpload.uploadImage.split('/').pop()
            }

            try {
                await s3Config.deleteObject(params, (err, data) => {
                    if (err) {
                        res.status(400).json({ msg: err.message })
                        console.log(err, err.stack) // an error occurred
                    }
                    else {
                        res.status(200).json({ msg: 'deleted!' })
                        console.log(params.Key + ' deleted from ' + params.Bucket)
                    }
                })

            }
            catch (err) {
                console.log('ERROR in file Deleting : ' + JSON.stringify(err))
                res.status(400).json({
                    msg: 'Failed to delete! ' + err.message,
                    success: false
                })
            }
        }

        const removedImageUpload = await imageUpload.deleteOne()

        if (!removedImageUpload)
            throw Error('Something went wrong while deleting!')

    } catch (err) {
        handleError(res, err);
    }
};