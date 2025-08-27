const express = require('express')
const cors = require('cors')
const { createServer } = require("http");
const dotenv = require('dotenv')
// For now, use direct mongoose connection until shared-utils is properly set up
const mongoose = require('mongoose');

// Config
dotenv.config()
const app = express()
const httpServer = createServer(app)

// Utils
const allowList = [
    'http://localhost:5173',
    'http://localhost:4000',
    'http://localhost:5002',
]

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowList.includes(origin)) {
            callback(null, true)
        } else {
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

// Response time header middleware removed to avoid conflicts

// Routes
app.use("/api/categories", require('./routes/categories'))
app.use("/api/quizzes", require('./routes/quizzes'))
app.use("/api/questions", require('./routes/questions'))

// home route
app.get('/', (req, res) => {
    res.send({
        service: 'QB Quizzing API',
        version: '2.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
    })
})

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1;
        res.json({
            service: 'quizzing-service',
            status: 'healthy',
            database: dbStatus ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            service: 'quizzing-service',
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Connect to database and start server
async function startService() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        httpServer.listen(process.env.PORT || 5002, () => {
            console.log(`Quizzing service is running on port ${process.env.PORT || 5002} and connected to MongoDB`);
        });
    } catch (err) {
        console.error('Failed to start quizzing service:', err);
        process.exit(1);
    }
}

startService();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await mongoose.connection.close();
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
