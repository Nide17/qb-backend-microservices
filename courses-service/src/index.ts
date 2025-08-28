import express from "express";
import mongoose, { Document, Schema, Model, model } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";




const { createServer } = require("http");


// Config
dotenv.config()
const app = express()
const httpServer = createServer(app)

// Utils
const allowList = [
    'http://localhost:5173',
    'http://localhost:4000',
    'http://localhost:5005',
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
app.use("/api/course-categories", require('./routes/course-categories'))
app.use("/api/courses", require('./routes/courses'))
app.use("/api/chapters", require('./routes/chapters'))
app.use("/api/notes", require('./routes/notes'))

// home route
app.get('/', (req, res) => { res.send('Welcome to QB courses API') })

// Error handling middleware
app.use((err, req, res, next) => {
    if (err) {
        res.status(500).json({ error: err.message });
    } else {
        next();
    }
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        httpServer.listen(process.env.PORT || 5005, () => {
            console.log(`Courses service is running on port ${process.env.PORT || 5005}, and MongoDB is connected`)
        })
    })
    .catch((err) => console.log(err))
