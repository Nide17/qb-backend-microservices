const mongoose = require('mongoose');

// Middleware to validate ObjectId parameters
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                error: `Invalid ${paramName}: ${id}` 
            });
        }
        
        next();
    };
};

module.exports = {
    validateObjectId
};
