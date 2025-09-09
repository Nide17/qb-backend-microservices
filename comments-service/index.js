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

// Utils
const allowList = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5010',
]

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowList.includes(origin)) {
            callback(null, true)
        } else {
            console.log(origin + ' is not allowed by CORS')
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
app.use("/api/quizzes-comments", require('./routes/quizzes-comments'))
app.use("/api/questions-comments", require('./routes/questions-comments'))

// home route
app.get('/', (req, res) => { res.send('Welcome to QB comments API') })


// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1;
        res.json({
            service: 'comments-service',
            status: 'healthy',
            database: dbStatus ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            service: 'comments-service',
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
    .connect(process.env.MONGODB_URI)
    .then(() => {
        httpServer.listen(process.env.PORT || 5010, () => {
            console.log(`Comments service is running on port ${process.env.PORT || 5010}, and MongoDB is connected`)
        })
    })
    .catch((err) => console.log(err));
