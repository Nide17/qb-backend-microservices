const express = require('express')
const cors = require('cors')
const compression = require('compression')
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
    'http://localhost:5006',
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
app.use(compression())

// Routes
app.use("/api/scores", require('./routes/scores'))

// home route
app.get('/', (req, res) => { res.send('Welcome to QB scores API') })

httpServer.listen(process.env.PORT || 5006, () => {
    console.log(`Scores service is running on port ${process.env.PORT || 5006}`)
})