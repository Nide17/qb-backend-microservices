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
import corsOptions from './utils/corsOptions.js'

// Middlewares
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use("/api/schools", require('./routes/schools'))
app.use("/api/levels", require('./routes/levels'))
app.use("/api/faculties", require('./routes/faculties'))

// home route
app.get('/', (req, res) => { res.send('Welcome to QB schools API') })

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
