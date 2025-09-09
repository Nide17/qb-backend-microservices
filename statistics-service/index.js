const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { notFoundHandler, globalErrorHandler } = require('./utils/error')

// Config
dotenv.config()
const app = express()

// Utils
const allowList = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5011',
]

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowList.includes(origin)) {
            callback(null, true)
        } else {
            console.log(`${origin} is not allowed by CORS`)
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
app.use("/api/statistics", require('./routes/statistics'))

// home route
app.get('/', (req, res) => { res.send('Welcome to QB statistics API') })


// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        res.json({
            service: 'statistics-service',
            status: 'healthy',
            database: 'not-required',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            service: 'statistics-service',
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

// Server
const PORT = process.env.PORT || 5011

app.listen(PORT, () => console.log(`Statistics service is running on port ${PORT}`));
