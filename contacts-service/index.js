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
const allowList = [
    'http://localhost:5173',
    'http://localhost:4000',
    'http://localhost:5008',
]

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowList.includes(origin)) {
            callback(null, true)
        } else {
            callback(null, true) // all allowed
            console.log(origin + ' is not allowed by CORS')
            // callback(new Error('Not allowed by CORS'))
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
app.use("/api/contacts", require('./routes/contacts'))
app.use("/api/broadcasts", require('./routes/broadcasts'))
app.use("/api/chat-rooms", require('./routes/chat-rooms'))
app.use("/api/room-messages", require('./routes/room-messages'))


// home route
app.get('/', (req, res) => { res.send('Welcome to QB contacts API') })

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        httpServer.listen(process.env.PORT || 5008, () => {
            console.log(`Contacts service is running on port ${process.env.PORT || 5008}, and MongoDB is connected`)
        })
    })
    .catch((err) => console.log(err))
