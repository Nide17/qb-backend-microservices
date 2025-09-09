
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createServer } = require("http")
const { Server } = require("socket.io")
const dotenv = require('dotenv')
const contactsSocketManager = require('./utils/enhanced-socket')
const { notFoundHandler, globalErrorHandler } = require('./utils/error')

// Config
dotenv.config()
const app = express()
const httpServer = createServer(app)

// Utils
const allowList = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5008',
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowList.includes(origin)) {
            callback(null, true);
        } else {
            console.log(origin + ' is not allowed by CORS');
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
    maxAge: 3600
};

// Middlewares
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use("/api/contacts", require('./routes/contacts'))
app.use("/api/broadcasts", require('./routes/broadcasts'))
app.use("/api/chat-rooms", require('./routes/chat-rooms'))
app.use("/api/room-messages", require('./routes/room-messages'))


// home route
app.get('/', (req, res) => { res.send('Welcome to QB contacts API') })


// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1;
        res.json({
            service: 'contacts-service',
            status: 'healthy',
            database: dbStatus ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            service: 'contacts-service',
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

// Database connection and server start
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        httpServer.listen(process.env.PORT || 5008, () => {
            console.log(`Contacts service is running on port ${process.env.PORT || 5008}, and MongoDB is connected`)
            
            // Initialize Socket.io with enhanced contacts functionality
            const io = new Server(httpServer, {
                cors: corsOptions,
                transports: ['websocket', 'polling']
            });
            
            contactsSocketManager.initialize(io);
            console.log('🔌 Enhanced contacts socket manager initialized');
        })
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err)
        process.exit(1)
    })
