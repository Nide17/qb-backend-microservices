import express from "express";
import mongoose, { Document, Schema, Model, model } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";






// Config
dotenv.config()
const app = express()

// MongoDB URI/dbName sanitizer to avoid invalid database names like "quizblog/users"
function sanitizeDbName(name, fallback) {
    const invalidChars = /[\s.$/\\\0]/g; // space, dot, $, /, \\, null
    let db = (name || '').trim()
    if (!db) return fallback
    if (invalidChars.test(db)) {
        const cleaned = db.replace(invalidChars, '_')
        console.warn(`users-service: Provided DB name '${db}' contained invalid characters. Using sanitized '${cleaned}'.`)
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
        console.warn('users-service: Could not parse MONGODB_URI to strip path; proceeding with provided URI')
    }

    return { uri, options: { dbName } }
}

// Utils
const allowList = [
    'http://localhost:5173',
    'http://localhost:4000',
    'http://localhost:5001',
]

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowList.includes(origin)) {
            callback(null, true)
        } else {
            console.error(`${origin} is not allowed by CORS`)
            callback(new Error('Not allowed by CORS'))
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
app.use("/api/users", require('./routes/users'))
app.use("/api/subscribed-users", require('./routes/subscribed-users'))

// Home route
app.get('/', (req, res) => res.send('Welcome to QB users API'))

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).send('Route not found')
})

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

mongoose
    .connect(buildMongoConfig('users').uri, buildMongoConfig('users').options)
    .then(() => {
        app.listen(process.env.PORT || 5001, () => {
            console.log(`Users service is running on port ${process.env.PORT || 5001}, and MongoDB is connected`)
        })
    })
    .catch((err) => console.log(err))
