const express = require('express');
const axios = require('axios');
// const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
// app.use(morgan('combined'));
app.use(cors());

const retryRequest = async (req, res, serviceUrl, retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios({
                method: req.method,
                url: `${serviceUrl}${req.originalUrl}`,
                data: req.body,
                headers: { 'x-auth-token': req.header('x-auth-token') },
            });
            return response;
        } catch (error) {
            if (i < retries - 1) {
                if (error.code === 'ECONNREFUSED') {
                    console.log(`Retrying request to ${serviceUrl}${req.originalUrl} (${i + 1}/${retries})`);
                    await new Promise(res => setTimeout(res, 1000)); // Wait 1 second before retrying
                } else if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                    res.status(504).send({
                        error: `Service at ${serviceUrl} [${req.originalUrl.split('/')[2]}] is taking too long to respond`
                    });
                    return;
                } else {
                    // console.error("Error in API Gateway:", error);
                    throw error;
                }
            } else {
                res.status(502).send({
                    error: `Service at ${serviceUrl} [${req.originalUrl.split('/')[2]}] is unavailable`
                });
                return;
            }
        }
    }
};

const routeToService = (serviceUrl) => async (req, res) => {
    // console.log(`Routing request to ${serviceUrl}${req.originalUrl}`);

    try {
        const response = await retryRequest(req, res, serviceUrl);
        if (response) {
            res.status(response.status).send(response.data);
        }
    } catch (error) {

        if (error.code === 'ECONNREFUSED') {
            res.status(502).send({
                error: `Service at ${serviceUrl} [${req.originalUrl.split('/')[2]}] is unavailable`
            });
        } else if (error.response) {
            const response = error.response;
            console.log(error.response.data);
            res.status(response.status).send({
                error: response.data.msg || response.data.error,
                id: response.data?.id,
            });
        } else {
            // console.error("Error in API Gateway:", error);
            res.status(500).send({
                error: `Something went wrong: ${req.originalUrl.split('/')[2]}`
            });
        }
    }
};

// Users Service
app.use('/api/users', routeToService(process.env.USERS_SERVICE_URL));
app.use('/api/subscribed-users', routeToService(process.env.USERS_SERVICE_URL));

// Quizzing Service
app.use('/api/categories', routeToService(process.env.QUIZZING_SERVICE_URL));
app.use('/api/quizzes', routeToService(process.env.QUIZZING_SERVICE_URL));
app.use('/api/questions', routeToService(process.env.QUIZZING_SERVICE_URL));

// Posts Service
app.use('/api/adverts', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/faqs', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/blog-posts', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/post-categories', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/image-uploads', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/blog-posts-views', routeToService(process.env.POSTS_SERVICE_URL));

// Schools Service
app.use('/api/schools', routeToService(process.env.SCHOOLS_SERVICE_URL));
app.use('/api/levels', routeToService(process.env.SCHOOLS_SERVICE_URL));
app.use('/api/faculties', routeToService(process.env.SCHOOLS_SERVICE_URL));

// Courses Service
app.use('/api/course-categories', routeToService(process.env.COURSES_SERVICE_URL));
app.use('/api/courses', routeToService(process.env.COURSES_SERVICE_URL));
app.use('/api/chapters', routeToService(process.env.COURSES_SERVICE_URL));
app.use('/api/notes', routeToService(process.env.COURSES_SERVICE_URL));

// Scores Service
app.use('/api/scores', routeToService(process.env.SCORES_SERVICE_URL));

// Downloads Service
app.use('/api/downloads', routeToService(process.env.DOWNLOADS_SERVICE_URL));

// Contacts Service
app.use('/api/contacts', routeToService(process.env.CONTACTS_SERVICE_URL));
app.use('/api/broadcasts', routeToService(process.env.CONTACTS_SERVICE_URL));
app.use('/api/chat-rooms', routeToService(process.env.CONTACTS_SERVICE_URL));
app.use('/api/room-messages', routeToService(process.env.CONTACTS_SERVICE_URL));

// Feedbacks Service
app.use('/api/feedbacks', routeToService(process.env.FEEDBACKS_SERVICE_URL));

// Comments Service
app.use('/api/quizzes-comments', routeToService(process.env.COMMENTS_SERVICE_URL));
app.use('/api/questions-comments', routeToService(process.env.COMMENTS_SERVICE_URL));

// Statistics Service
app.use('/api/statistics', routeToService(process.env.STATISTICS_SERVICE_URL));

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send({ status: 'API Gateway is running' });
});

// 404 Route Not Found
app.use((req, res, next) => {
    res.status(404).send({ error: `Route ${req.url} not found` });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    console.error(err);
    res.status(err.status || 500).send({ error: err.message });
});

// Port
const PORT = process.env.PORT || 5000;
// Start the API Gateway
app.listen(PORT, () => console.log(`API Gateway is running on port ${PORT}`));
