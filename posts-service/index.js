const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createServer } = require("http");
const dotenv = require('dotenv')
const { notFoundHandler, globalErrorHandler } = require('./utils/error')

// Config
dotenv.config()
const app = express()
const httpServer = createServer(app)

// Process-level error handlers to prevent service crashes
process.on('uncaughtException', (error) => {
    console.error('Posts service uncaught exception:', error);
    // Log the error but don't exit the process for service resilience
    // In production, you might want to restart the service after logging
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Posts service unhandled rejection at:', promise, 'reason:', reason);
    // Log the error but don't exit the process for service resilience
});

// MongoDB URI/dbName sanitizer to avoid invalid database names like "quizblog/posts"
function sanitizeDbName(name, fallback) {
    const invalidChars = /[\s.$/\\\0]/g; // space, dot, $, /, \\, null
    let db = (name || '').trim()
    if (!db) return fallback
    if (invalidChars.test(db)) {
        const cleaned = db.replace(invalidChars, '_')
        console.warn(`posts-service: Provided DB name '${db}' contained invalid characters. Using sanitized '${cleaned}'.`)
        return cleaned
    }
    return db
}

function buildMongoConfig(defaultDb) {
    const rawUri = process.env.MONGODB_URI
    const explicitDb = process.env.DB_NAME
    const dbName = sanitizeDbName(explicitDb || defaultDb, defaultDb)

    let uri = rawUri
    try {
        // Strip any path component from URI; we'll set dbName via options
        const u = new URL(rawUri)
        u.pathname = '/'
        uri = u.toString()
    } catch (e) {
        // If URL parsing fails (older Node or unusual URI), keep original
        console.warn('posts-service: Could not parse MONGODB_URI to strip path; proceeding with provided URI')
    }

    return { uri, options: { dbName } }
}

// Utils
const allowList = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:5002',
]

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowList.includes(origin)) {
            callback(null, true)
        } else {
            callback(null, true) // all allowed
            console.log(origin + ' is not allowed by CORS')
            // callback(new Error('Not allowed by CORS'))
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    preflightContinue: false,
optionsSuccessStatus: 200,
    maxAge: 3600
}

// Middlewares
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use("/api/adverts", require('./routes/adverts'))
app.use("/api/faqs", require('./routes/faqs'))
app.use('/api/blog-posts', require('./routes/blog-posts/blog-posts'))
app.use('/api/post-categories', require('./routes/blog-posts/post-categories'))
app.use('/api/image-uploads', require('./routes/blog-posts/image-uploads'))
app.use('/api/blog-posts-views', require('./routes/blog-posts/blog-posts-views'))

// home route
app.get('/', (req, res) => { res.send('Welcome to QB Posts API') })

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1;
        res.json({
            service: 'posts-service',
            status: 'healthy',
            database: dbStatus ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            service: 'posts-service',
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Handle 404 errors
app.use(notFoundHandler())

// Global error handler
app.use(globalErrorHandler())

mongoose
    .connect(buildMongoConfig('posts-service').uri, buildMongoConfig('posts-service').options)
    .then(() => {
        httpServer.listen(process.env.PORT || 5003, () => {
            console.log(`Posts service is running on port ${process.env.PORT || 5003}, and MongoDB is connected`)
        })
    })
    .catch((err) => console.log(err))
