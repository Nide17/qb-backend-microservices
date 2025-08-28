import * as path from 'path';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

const { S3 } = require("@aws-sdk/client-s3")




// AWS S3 Configuration
const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION
})

// File Filter for multer to check if the file is an image
const fileFilter = (req, file, callback) => {
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/svg']

    if (allowedFileTypes.includes(file.mimetype)) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

// Uploading image locally if multer is working.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, 'imageUploads'));
    },
    filename: (req, file, callback) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-').replace(/[^a-zA-Z0-9.]/g, '-')
        callback(null, req.params.id + '-' + fileName)
    }
})

// Uploading image to aws
const multerS3Config = multerS3({
    s3: s3Config,
    bucket: process.env.S3_BUCKET,
    metadata: (req, file, callback) => {
        callback(null, { fieldName: file.fieldname })
    },
    key: (req, file, callback) => {
        const folderName = 'imageUploads/';
        const fileName = file.originalname.toLowerCase().split(' ').join('-').replace(/[^a-zA-Z0-9.]/g, '-')
        callback(null, folderName + req.params.id + '-' + fileName)
    }
})

// Multer Configuration for uploading image on AWS S3 or locally
const upload = multer({
    storage: multerS3Config,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2000000 // 1000000 Bytes = 1 MB (2MB)
    }
})

exports.imgUpload = upload