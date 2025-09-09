const handleError = (res, err, status = 500) => {
    // Log error for debugging
    console.error('Error:', err.message || err);
    
    // Handle specific MongoDB errors
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation failed', details: err.message });
    }
    
    if (err.code === 11000) {
        return res.status(409).json({ message: 'Duplicate entry' });
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Authentication failed' });
    }
    
    // Default error response
    res.status(status).json({ 
        message: err.message || 'Internal server error'
    });
};

// 404 handler
const notFoundHandler = () => {
    return (req, res) => {
        res.status(404).json({ message: `Route ${req.originalUrl} not found` });
    };
};

// Global error handler
const globalErrorHandler = () => {
    return (err, req, res, next) => {
        handleError(res, err);
    };
};

module.exports = { 
    handleError,
    notFoundHandler,
    globalErrorHandler
};
