const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { createServer } = require("http");
const dotenv = require('dotenv')

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
