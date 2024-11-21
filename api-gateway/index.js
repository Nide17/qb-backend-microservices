const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(morgan('combined'));
app.use(cors());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.send({ status: 'API Gateway is running' });
});

const routeToService = (serviceUrl) => async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${serviceUrl}${req.originalUrl}`,
            data: req.body,
            headers: { 'x-auth-token': req.header('x-auth-token') },
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).send({ error: error.message });
    }
};

// Routing to Services
app.use('/api/users', routeToService(process.env.USERS_SERVICE_URL));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send({ error: err.message });
});

// Start the API Gateway
app.listen(5000, () => console.log(`API Gateway is running on port ${5000}`));
