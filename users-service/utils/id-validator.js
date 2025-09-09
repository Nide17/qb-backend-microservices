const mongoose = require('mongoose');

/**
 * Validates ObjectId format and sends appropriate error response if invalid
 * @param {string} id - The ID to validate
 * @param {object} res - Express response object
 * @param {string} fieldName - Name of the field being validated (default: 'ID')
 * @returns {boolean} - true if valid, false if invalid (response already sent)
 */
const validateObjectId = (id, res, fieldName = 'ID') => {
    if (!id) {
        res.status(400).json({
            success: false,
            message: `${fieldName} is required`,
            code: 'MISSING_ID'
        });
        return false;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: `Invalid ${fieldName} format provided`,
            code: 'INVALID_ID_FORMAT'
        });
        return false;
    }

    return true;
};

/**
 * Validates multiple ObjectIds
 * @param {array} ids - Array of IDs to validate
 * @param {object} res - Express response object
 * @param {string} fieldName - Name of the field being validated (default: 'IDs')
 * @returns {boolean} - true if all valid, false if any invalid (response already sent)
 */
const validateObjectIds = (ids, res, fieldName = 'IDs') => {
    if (!Array.isArray(ids)) {
        res.status(400).json({
            success: false,
            message: `${fieldName} must be an array`,
            code: 'INVALID_FORMAT'
        });
        return false;
    }

    for (let i = 0; i < ids.length; i++) {
        if (!mongoose.Types.ObjectId.isValid(ids[i])) {
            res.status(400).json({
                success: false,
                message: `Invalid ${fieldName} format at index ${i}`,
                code: 'INVALID_ID_FORMAT'
            });
            return false;
        }
    }

    return true;
};

/**
 * Middleware to validate req.params.id before processing
 */
const validateParamId = (fieldName = 'ID') => {
    return (req, res, next) => {
        if (!validateObjectId(req.params.id, res, fieldName)) {
            return; // Response already sent
        }
        next();
    };
};

module.exports = {
    validateObjectId,
    validateObjectIds,
    validateParamId
};
