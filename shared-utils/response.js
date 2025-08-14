class ResponseHandler {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
            statusCode
        });
    }

    static error(res, error, statusCode = 500) {
        const errorMessage = error.message || 'Internal server error';
        const errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined;

        return res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                details: errorDetails,
                timestamp: new Date().toISOString()
            },
            statusCode
        });
    }

    static validationError(res, errors, message = 'Validation failed') {
        return res.status(400).json({
            success: false,
            message,
            errors: Array.isArray(errors) ? errors : [errors],
            timestamp: new Date().toISOString(),
            statusCode: 400
        });
    }

    static notFound(res, resource = 'Resource') {
        return res.status(404).json({
            success: false,
            message: `${resource} not found`,
            timestamp: new Date().toISOString(),
            statusCode: 404
        });
    }

    static unauthorized(res, message = 'Unauthorized access') {
        return res.status(401).json({
            success: false,
            message,
            timestamp: new Date().toISOString(),
            statusCode: 401
        });
    }

    static forbidden(res, message = 'Access forbidden') {
        return res.status(403).json({
            success: false,
            message,
            timestamp: new Date().toISOString(),
            statusCode: 403
        });
    }

    static paginated(res, data, page, limit, total, message = 'Data retrieved successfully') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            timestamp: new Date().toISOString(),
            statusCode: 200
        });
    }

    static created(res, data, message = 'Resource created successfully') {
        return this.success(res, data, message, 201);
    }

    static updated(res, data, message = 'Resource updated successfully') {
        return this.success(res, data, message, 200);
    }

    static deleted(res, message = 'Resource deleted successfully') {
        return res.status(200).json({
            success: true,
            message,
            timestamp: new Date().toISOString(),
            statusCode: 200
        });
    }

    // For aggregated responses
    static aggregated(res, data, sources, message = 'Data aggregated successfully') {
        return res.status(200).json({
            success: true,
            message,
            data,
            aggregation: {
                sources,
                timestamp: new Date().toISOString(),
                cached: data._cached || false
            },
            statusCode: 200
        });
    }
}

module.exports = ResponseHandler;
