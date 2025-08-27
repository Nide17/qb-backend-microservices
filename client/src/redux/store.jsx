import { configureStore } from '@reduxjs/toolkit'

import authReducer from './slices/authSlice'
import advertsReducer from './slices/advertsSlice'
import subscribersReducer from './slices/subscribersSlice'
import questionsReducer from './slices/questionsSlice'
import categoriesReducer from './slices/categoriesSlice'
import quizesReducer from './slices/quizesSlice'
import scoresReducer from './slices/scoresSlice'
import contactsReducer from './slices/contactsSlice'
import broadcastsReducer from './slices/broadcastsSlice'
import courseCategoriesReducer from './slices/courseCategoriesSlice'
import coursesReducer from './slices/coursesSlice'
import chaptersReducer from './slices/chaptersSlice'
import notesReducer from './slices/notesSlice'
import downloadsReducer from './slices/downloadsSlice'
import schoolsReducer from './slices/schoolsSlice'
import levelsReducer from './slices/levelsSlice'
import facultiesReducer from './slices/facultiesSlice'
import logsReducer from './slices/logsSlice'
import faqsReducer from './slices/faqsSlice'
import quizzesCommentsReducer from './slices/quizzesCommentsSlice'
import questionsCommentsReducer from './slices/questionsCommentsSlice'
import postCategoriesReducer from './slices/postCategoriesSlice'
import blogPostsReducer from './slices/blogPostsSlice'
import imageUploadsReducer from './slices/imageUploadsSlice'
import blogPostsViewsReducer from './slices/blogPostsViewsSlice'
import statisticsReducer from './slices/statisticsSlice'
import feedbacksReducer from './slices/feedbacksSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        adverts: advertsReducer,
        subscribers: subscribersReducer,
        questions: questionsReducer,
        categories: categoriesReducer,
        quizes: quizesReducer,
        scores: scoresReducer,
        contacts: contactsReducer,
        broadcasts: broadcastsReducer,
        courseCategories: courseCategoriesReducer,
        courses: coursesReducer,
        chapters: chaptersReducer,
        notes: notesReducer,
        downloads: downloadsReducer,
        schools: schoolsReducer,
        levels: levelsReducer,
        faculties: facultiesReducer,
        logs: logsReducer,
        faqs: faqsReducer,
        quizzesComments: quizzesCommentsReducer,
        questionsComments: questionsCommentsReducer,
        postCategories: postCategoriesReducer,
        blogPosts: blogPostsReducer,
        imageUploads: imageUploadsReducer,
        blogPostsViews: blogPostsViewsReducer,
        statistics: statisticsReducer,
        feedbacks: feedbacksReducer
    },
    devTools: process.env.NODE_ENV === 'development',
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false  // Disable the SerializableStateInvariantMiddleware
    })
})

export default store