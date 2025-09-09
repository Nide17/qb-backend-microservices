/**
 * Direct Service Client for Scores Service
 * Handles direct HTTP communication with other microservices
 */
const axios = require('axios');

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;
const QUIZZING_SERVICE_URL = process.env.QUIZZING_SERVICE_URL;
const SCHOOLS_SERVICE_URL = process.env.SCHOOLS_SERVICE_URL;
const SCORES_SERVICE_URL = process.env.SCORES_SERVICE_URL;
const COURSES_SERVICE_URL = process.env.COURSES_SERVICE_URL;

class DirectServiceClient {
  constructor() {
  }

  // User-related methods
  async populateUserData(userId) {
    try {
      if (!userId) return null;
      const response = await axios.get(`${USERS_SERVICE_URL}/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error.message);
      return null;
    }
  }

  async getUser(userId) {
    return this.populateUserData(userId);
  }

  // Quiz-related methods
  async populateQuizData(quizId) {
    try {
      if (!quizId) return null;
      const response = await axios.get(`${QUIZZING_SERVICE_URL}/api/quizzing/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz ${quizId}:`, error.message);
      return null;
    }
  }

  async getQuiz(quizId) {
    return this.populateQuizData(quizId);
  }

  // Course-related methods
  async populateCourseData(courseId) {
    try {
      if (!courseId) return null;
      const response = await axios.get(`${COURSES_SERVICE_URL}/api/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error.message);
      return null;
    }
  }

  async getCourse(courseId) {
    return this.populateCourseData(courseId);
  }

  async getChapter(chapterId) {
    try {
      if (!chapterId) return null;
      const response = await axios.get(`${COURSES_SERVICE_URL}/api/courses/chapters/${chapterId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chapter ${chapterId}:`, error.message);
      return null;
    }
  }

  // School-related methods
  async getSchool(schoolId) {
    try {
      if (!schoolId) return null;
      const response = await axios.get(`${SCHOOLS_SERVICE_URL}/api/schools/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school ${schoolId}:`, error.message);
      return null;
    }
  }

  async getLevel(levelId) {
    try {
      if (!levelId) return null;
      const response = await axios.get(`${SCHOOLS_SERVICE_URL}/api/schools/levels/${levelId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching level ${levelId}:`, error.message);
      return null;
    }
  }

  async getFaculty(facultyId) {
    try {
      if (!facultyId) return null;
      const response = await axios.get(`${SCHOOLS_SERVICE_URL}/api/schools/faculties/${facultyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching faculty ${facultyId}:`, error.message);
      return null;
    }
  }

  // Category-related methods
  async getCategory(categoryId) {
    try {
      if (!categoryId) return null;
      const response = await axios.get(`${QUIZZING_SERVICE_URL}/api/quizzing/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error.message);
      return null;
    }
  }

  // Score-related methods
  async getScore(scoreId) {
    try {
      if (!scoreId) return null;
      const response = await axios.get(`${SCORES_SERVICE_URL}/api/scores/${scoreId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching score ${scoreId}:`, error.message);
      return null;
    }
  }
}

// Create and export singleton instance
const directServiceClient = new DirectServiceClient();
module.exports = directServiceClient;
