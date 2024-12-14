const axios = require('axios');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;
const { handleError } = require('../utils/error');

exports.get50NewUsers = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                limit: 50,
                sort: '-register_date'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`);
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithImage = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'image'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithSchool = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'school'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithLevel = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'level'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithFaculty = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'faculty'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithYear = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'year'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithInterests = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'interests'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithAbout = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'about'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getTop100Quizzing = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/scores/top100`);
        const scores = response.data;

        res.json(scores);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getTop100Downloaders = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/downloads/top100`);
        const downloadsCount = response.data;

        res.json(downloadsCount);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getTop20Quizzes = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/scores/top20quizzes`);
        const quizStatistics = response.data;

        res.json(quizStatistics);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizzesStats = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/scores/quizzesStats`);
        const quizStatistics = response.data;

        res.json(quizStatistics);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getTop20Notes = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/downloads/top20notes`);
        const notesStats = response.data;

        res.json(notesStats);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getNotesStats = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/downloads/notesStats`);
        const notesStats = response.data;

        res.json(notesStats);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizCategoriesStats = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/scores/quizCategoriesStats`);
        const categoriesStats = response.data;

        res.json(categoriesStats);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getNotesCategoriesStats = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/downloads/notesCategoriesStats`);
        const categoriesStats = response.data;

        res.json(categoriesStats);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getDailyUserRegistration = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users/dailyRegistration`);
        const usersStats = response.data;

        res.json(usersStats);
    } catch (err) {
        handleError(res, err);
    }
};
