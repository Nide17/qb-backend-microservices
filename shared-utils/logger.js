const winston = require('winston');

class Logger {
    constructor(serviceName) {
        this.serviceName = serviceName;

        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: serviceName },
            transports: [
                // Console transport
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                // File transport for errors
                new winston.transports.File({
                    filename: `logs/${serviceName}-error.log`,
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                }),
                // File transport for all logs
                new winston.transports.File({
                    filename: `logs/${serviceName}-combined.log`,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                })
            ]
        });

        // Handle uncaught exceptions
        this.logger.exceptions.handle(
            new winston.transports.File({ filename: `logs/${serviceName}-exceptions.log` })
        );

        // Handle unhandled rejections
        this.logger.rejections.handle(
            new winston.transports.File({ filename: `logs/${serviceName}-rejections.log` })
        );
    }

    info(message, meta = {}) {
        this.logger.info(message, meta);
    }

    error(message, meta = {}) {
        this.logger.error(message, meta);
    }

    warn(message, meta = {}) {
        this.logger.warn(message, meta);
    }

    debug(message, meta = {}) {
        this.logger.debug(message, meta);
    }

    // Log HTTP requests
    logRequest(req, res, responseTime) {
        this.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
    }

    // Log database operations
    logDatabase(operation, collection, duration, success = true) {
        this.info('Database Operation', {
            operation,
            collection,
            duration: `${duration}ms`,
            success
        });
    }

    // Log service communication
    logServiceCall(service, endpoint, duration, success = true) {
        this.info('Service Communication', {
            service,
            endpoint,
            duration: `${duration}ms`,
            success
        });
    }
}

module.exports = Logger;
