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
    'http://localhost:5002',
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
app.use("/api/adverts", require('./routes/adverts'))
app.use("/api/faqs", require('./routes/faqs'))
app.use('/api/blog-posts', require('./routes/blog-posts/blog-posts'))
app.use('/api/posts-categories', require('./routes/blog-posts/posts-categories'))
app.use('/api/image-ploads', require('./routes/blog-posts/image-uploads'))
app.use('/api/blog-posts-views', require('./routes/blog-posts/blog-posts-views'))

// home route
app.get('/', (req, res) => { res.send('Welcome to QB Posts API') })

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        httpServer.listen(process.env.PORT || 5003, () => {
            console.log(`Posts service is running on port ${process.env.PORT || 5003}, and MongoDB is connected`)
        })
    })
    .catch((err) => console.log(err))
