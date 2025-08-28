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

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        httpServer.listen(process.env.PORT || 5010, () => {
            console.log(`Comments service is running on port ${process.env.PORT || 5010}, and MongoDB is connected`)
        })
    })
    .catch((err) => console.log(err));
