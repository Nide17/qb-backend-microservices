/**
 * Population Utilities for Controllers
 * Centralized population logic moved from models
 */

const directServiceClient = require('./direct-service-client');

class PopulationUtils {
  
  // Populate user-related data
  async populateUsers(items, userFields = ['created_by', 'last_updated_by']) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    for (const item of items) {
      for (const field of userFields) {
        if (item[field]) {
          const userData = await directServiceClient.populateUserData(item[field]);
          item[field] = userData;
        }
      }
    }

    return items.length === 1 ? items[0] : items;
  }

  // Populate quiz-related data
  async populateQuizData(items, quizFields = ['quiz']) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    for (const item of items) {
      for (const field of quizFields) {
        if (item[field]) {
          const quizData = await directServiceClient.populateQuizData(item[field]);
          item[field] = quizData;
        }
      }
    }

    return items.length === 1 ? items[0] : items;
  }

  // Populate course-related data
  async populateCourseData(items, courseFields = ['course']) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    for (const item of items) {
      for (const field of courseFields) {
        if (item[field]) {
          const courseData = await directServiceClient.populateCourseData(item[field]);
          item[field] = courseData;
        }
      }
    }

    return items.length === 1 ? items[0] : items;
  }

  // Populate school-related data
  async populateSchoolData(user) {
    if (!user) return user;

    const populationPromises = [];

    if (user.school) {
      populationPromises.push(
        directServiceClient.getSchool(user.school).then(school => {
          user.school = school || { _id: user.school, title: 'Unknown School' };
        })
      );
    }

    if (user.level) {
      populationPromises.push(
        directServiceClient.getLevel(user.level).then(level => {
          user.level = level || { _id: user.level, title: 'Unknown Level' };
        })
      );
    }

    if (user.faculty) {
      populationPromises.push(
        directServiceClient.getFaculty(user.faculty).then(faculty => {
          user.faculty = faculty || { _id: user.faculty, title: 'Unknown Faculty' };
        })
      );
    }

    await Promise.allSettled(populationPromises);
    return user;
  }

  // Populate quiz details for scores
  async populateScoreDetails(score) {
    if (!score) return score;

    const populationPromises = [];

    if (score.category) {
      populationPromises.push(
        directServiceClient.getCategory(score.category).then(category => {
          score.category = category || { _id: score.category, title: 'Unknown Category' };
        })
      );
    }

    if (score.quiz) {
      populationPromises.push(
        directServiceClient.getQuiz(score.quiz).then(quiz => {
          score.quiz = quiz || { _id: score.quiz, title: 'Unknown Quiz' };
        })
      );
    }

    if (score.taken_by) {
      populationPromises.push(
        directServiceClient.getUser(score.taken_by).then(user => {
          score.taken_by = user || { _id: score.taken_by, name: 'Unknown User' };
        })
      );
    }

    await Promise.allSettled(populationPromises);
    return score;
  }

  // Populate feedback details
  async populateFeedbackDetails(feedback) {
    if (!feedback) return feedback;

    const populationPromises = [];

    if (feedback.quiz) {
      populationPromises.push(
        directServiceClient.getQuiz(feedback.quiz).then(quiz => {
          feedback.quiz = quiz || { _id: feedback.quiz, title: 'Unknown Quiz' };
        })
      );
    }

    if (feedback.score) {
      populationPromises.push(
        directServiceClient.getScore(feedback.score).then(async (score) => {
          if (score && score.taken_by) {
            const user = await directServiceClient.getUser(score.taken_by);
            score.taken_by = user || { _id: score.taken_by, name: 'Unknown User' };
          }
          feedback.score = score || { _id: feedback.score };
        })
      );
    }

    await Promise.allSettled(populationPromises);
    return feedback;
  }

  // Populate comment details
  async populateCommentDetails(comment, type = 'quiz') {
    if (!comment) return comment;

    const populationPromises = [];

    if (comment.sender) {
      populationPromises.push(
        directServiceClient.getUser(comment.sender).then(user => {
          comment.sender = user || { _id: comment.sender, name: 'Unknown User' };
        })
      );
    }

    if (type === 'quiz' && comment.quiz) {
      populationPromises.push(
        directServiceClient.getQuiz(comment.quiz).then(quiz => {
          comment.quiz = quiz || { _id: comment.quiz, title: 'Unknown Quiz' };
        })
      );
    }

    await Promise.allSettled(populationPromises);
    return comment;
  }

  // Populate download details
  async populateDownloadDetails(download) {
    if (!download) return download;

    const populationPromises = [];

    if (download.downloaded_by) {
      populationPromises.push(
        directServiceClient.getUser(download.downloaded_by).then(user => {
          download.downloaded_by = user || { _id: download.downloaded_by, name: 'Unknown User' };
        })
      );
    }

    if (download.course) {
      populationPromises.push(
        directServiceClient.getCourse(download.course).then(course => {
          download.course = course || { _id: download.course, title: 'Unknown Course' };
        })
      );
    }

    if (download.chapter) {
      populationPromises.push(
        directServiceClient.getChapter(download.chapter).then(chapter => {
          download.chapter = chapter || { _id: download.chapter, title: 'Unknown Chapter' };
        })
      );
    }

    await Promise.allSettled(populationPromises);
    return download;
  }

  // Generic population for arrays
  async populateArray(items, populationFn) {
    if (!Array.isArray(items)) return items;
    
    const populatedItems = await Promise.allSettled(
      items.map(item => populationFn(item))
    );
    
    return populatedItems.map(result => 
      result.status === 'fulfilled' ? result.value : null
    ).filter(item => item !== null);
  }
}

module.exports = new PopulationUtils();
