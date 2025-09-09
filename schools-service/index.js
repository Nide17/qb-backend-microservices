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
const corsOptions = require('./utils/corsOptions')

// Middlewares
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use("/api/schools", require('./routes/schools'))
app.use("/api/levels", require('./routes/levels'))
app.use("/api/faculties", require('./routes/faculties'))

// home route
app.get('/', (req, res) => { res.send('Welcome to QB schools API') })


// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1;
        res.json({
            service: 'schools-service',
            status: 'healthy',
            database: dbStatus ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            service: 'schools-service',
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

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        httpServer.listen(process.env.PORT || 5004, () => {
            console.log(`Schools service is running on port ${process.env.PORT || 5004}, and MongoDB is connected`)
        })
    } catch (err) {
        console.error('Failed to connect to MongoDB', err)
    }
}

startServer()
