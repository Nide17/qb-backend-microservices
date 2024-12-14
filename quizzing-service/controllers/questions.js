const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const { S3 } = require("@aws-sdk/client-s3");
const { handleError } = require('../utils/error');

// AWS S3 Configuration
const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION,
});

// Helper function to find question by ID
const findQuestionById = async (id, res, selectFields = '') => {
    try {
        const question = await Question.findById(id).select(selectFields).populate('category quiz');
        if (!question) return res.status(404).json({ msg: 'No question found!' });
        return question;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to delete image from S3
const deleteImageFromS3 = async (imageUrl) => {
    if (!imageUrl) return;
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: imageUrl.split('/').pop(),
    };
    return new Promise((resolve, reject) => {
        s3Config.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                reject(err);
            } else {
                console.log(params.Key + ' deleted!');
                resolve(data);
            }
        });
    });
};

// Helper function to update quiz questions
const updateQuizQuestions = async (quizId, questionId, action) => {
    const update = action === 'add' ? { $addToSet: { questions: questionId } } : { $pull: { questions: questionId } };
    await Quiz.updateOne({ _id: quizId }, update);
};

exports.getQuestions = async (req, res) => {
    console.log('getQuestions');
    try {
        const questions = await Question.find().sort({ createdAt: -1 }).populate('category quiz');
        if (!questions) return res.status(404).json({ msg: 'No questions found!' });
        res.status(200).json(questions);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneQuestion = async (req, res) => {
    const question = await findQuestionById(req.params.id, res);
    if (question) res.status(200).json(question);
};

exports.createQuestion = async (req, res) => {
    const { questionText, quiz, category, created_by, answerOptions, duration } = req.body;
    const qnImage = req.file;

    // Parse answer options from frontend
    const answers = answerOptions.map(a => JSON.parse(a));

    // Simple validation
    if (!questionText && !qnImage) {
        return res.status(400).json({ msg: 'Question text or Image is required!' });
    } else if (!questionText || !quiz || !category || !answerOptions || !duration) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    try {
        let qtn = await Question.findOne({ questionText });

        if (qtn) {
            return res.status(400).json({ msg: 'A question with same name already exists!' });
        }

        const newQuestion = new Question({
            questionText,
            question_image: qnImage && qnImage.location,
            answerOptions: answers,
            category,
            quiz,
            created_by,
            duration,
        });

        const savedQuestion = await newQuestion.save();

        // Update the Quiz on Question creation
        await updateQuizQuestions(quiz, savedQuestion._id, 'add');

        if (!savedQuestion) throw Error('Something went wrong during creation!');

        res.status(200).json(savedQuestion);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateQuestion = async (req, res) => {
    const { questionText, answerOptions, newQuiz, oldQuizID, last_updated_by, duration } = req.body;
    const qnImage = req.file;

    // Find the Question by id
    const qtn = await Question.findOne({ _id: req.params.id });
    if (!qtn) throw Error('Failed! question does not exists!');

    try {
        // Changing question's quiz
        if (newQuiz && oldQuizID) {
            const updatedQuestion = await Question.findByIdAndUpdate({ _id: qtn._id }, {
                quiz: newQuiz,
                last_updated_by,
            }, { new: true });

            // Delete Question in old quiz
            await updateQuizQuestions(oldQuizID, qtn._id, 'remove');

            // Update the Quiz on Question updating
            await updateQuizQuestions(newQuiz, qtn._id, 'add');

            res.status(200).json(updatedQuestion);
        } else {
            // Changing answerOptions from string to json
            const answers = answerOptions.map(a => JSON.parse(a));

            // Delete existing image
            if (qnImage && qtn.question_image) {
                await deleteImageFromS3(qtn.question_image);
            }

            // Find the question by id and update
            const updatedQuestion = await Question.findByIdAndUpdate({ _id: qtn._id }, {
                questionText,
                question_image: qnImage && qnImage.location,
                answerOptions: answers,
                last_updated_by,
                duration,
            }, { new: true });

            res.status(200).json(updatedQuestion);
        }
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        // Find the Question to delete by id first
        const question = await Question.findById(req.params.id);
        if (!question) throw Error('Question is not found!');

        // Delete existing image
        await deleteImageFromS3(question.question_image);

        // Remove question from questions of the quiz
        await updateQuizQuestions(question.quiz, question._id, 'remove');

        // Delete the question
        const removedQuestion = await Question.deleteOne({ _id: req.params.id });

        if (!removedQuestion) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};
