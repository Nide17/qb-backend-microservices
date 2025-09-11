const handleError = (res, err, status) => {
    console.error('Error occurred:', err);

    // Handle MongoDB Cast Errors
    if (err.name === 'CastError') {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid ID format provided',
                code: 'INVALID_ID_FORMAT',
                error: 'The provided ID is not a valid MongoDB ObjectId',
                timestamp: new Date().toISOString()
            });
        }
        return res.status(400).json({ 
            success: false,
            message: `Invalid ${err.path} format`,
            code: 'CAST_ERROR',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }

    // Handle MongoDB Validation Errors
    if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message,
            value: e.value
        }));
        return res.status(400).json({ 
            success: false,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: validationErrors,
            timestamp: new Date().toISOString()
        });
    }

    // Handle MongoDB Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({ 
            success: false,
            message: `${field} already exists`,
            code: 'DUPLICATE_KEY',
            error: `A record with this ${field} already exists`,
            timestamp: new Date().toISOString()
        });
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            success: false,
            message: 'Invalid token',
            code: 'INVALID_TOKEN',
            timestamp: new Date().toISOString()
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            success: false,
            message: 'Token has expired',
            code: 'TOKEN_EXPIRED',
            timestamp: new Date().toISOString()
        });
    }

    // // Handle Axios Errors
    // if (err.isAxiosError) {
    //     if (err.response) {
    //         return res.status(err.response.status).json({
    //             success: false,
    //             message: err.response.data?.message || err.response.data?.msg || err.message,
    //             code: `HTTP_${err.response.status}`,
    //             timestamp: new Date().toISOString()
    //         });
    //     } else if (err.request) {
    //         return res.status(503).json({
    //             success: false,
    //             message: `Users Service Unavailable`,
    //             code: 'SERVICE_UNAVAILABLE',
    //             timestamp: new Date().toISOString()
    //         });
    //     }
    // }

    // Default error response
    const statusCode = status || err.statusCode || 500;
    res.status(statusCode).json({ 
        success: false,
        message: err.message || 'Internal server error',
        code: err.code || 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    });
}

// Simple async handler wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(error => {
            handleError(res, error);
        });
    };
};

// Simple 404 handler
const notFoundHandler = () => {
    return (req, res, next) => {
        return res.status(404).json({
            success: false,
            message: `Route ${req.originalUrl} does not exist`,
            code: 'NOT_FOUND',
            timestamp: new Date().toISOString()
        });
    };
};

// Simple global error handler
const globalErrorHandler = () => {
    return (error, req, res, next) => {
        handleError(res, error);
    };
};

module.exports = { 
    handleError,
    asyncHandler,
    notFoundHandler,
    globalErrorHandler
};