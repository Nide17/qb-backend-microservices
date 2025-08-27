import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../../utils/socket';
import { apiCallHelper } from '../../redux/configHelpers';
import { notifyToast } from '../../utils/notifyToast';

const RealTimeQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [participants, setParticipants] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch quiz data
    const fetchQuiz = useCallback(async () => {
        try {
            const response = await apiCallHelper(`/api/aggregated/quiz/${id}`, 'GET');
            if (response.data) {
                setQuiz(response.data);
                if (response.data.duration) {
                    setTimeRemaining(response.data.duration * 60); // Convert to seconds
                }
            }
        } catch (err) {
            console.error('Error fetching quiz:', err);
            notifyToast.error('Failed to load quiz');
            navigate('/quizzes');
        }
    }, [id, navigate]);

    // Fetch leaderboard
    const fetchLeaderboard = useCallback(async () => {
        try {
            const response = await apiCallHelper(`/api/scores/ranking/${id}`, 'GET');
            if (response.data) {
                setLeaderboard(response.data.slice(0, 10)); // Top 10
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        }
    }, [id]);

    // Handle real-time updates
    const handleLeaderboardUpdate = useCallback((data) => {
        if (data.quizId === id) {
            fetchLeaderboard();
            setParticipants(prev => prev + 1);
            notifyToast.info(`New participant joined! Score: ${data.newScore.marks}/${data.newScore.out_of}`);
        }
    }, [id, fetchLeaderboard]);

    const handleQuizProgress = useCallback((data) => {
        if (data.quizId === id) {
            // Update participant count or other progress indicators
            console.log('Quiz progress update:', data);
        }
    }, [id]);

    // Timer effect
    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [timeRemaining]);

    // Initialize quiz
    useEffect(() => {
        const initializeQuiz = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchQuiz(),
                    fetchLeaderboard()
                ]);
                
                // Join quiz room for real-time updates
                socketService.joinQuizRoom(id);
                
                // Set up real-time listeners
                socketService.on('leaderboard-update', handleLeaderboardUpdate);
                socketService.on('quiz-progress-update', handleQuizProgress);
                
            } catch (err) {
                console.error('Error initializing quiz:', err);
            } finally {
                setLoading(false);
            }
        };

        initializeQuiz();

        return () => {
            socketService.off('leaderboard-update', handleLeaderboardUpdate);
            socketService.off('quiz-progress-update', handleQuizProgress);
        };
    }, [id, fetchQuiz, fetchLeaderboard, handleLeaderboardUpdate, handleQuizProgress]);

    const handleAnswerChange = (questionIndex, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));

        // Send progress update
        socketService.sendQuizProgress({
            quizId: id,
            questionIndex,
            totalQuestions: quiz?.questions?.length || 0,
            progress: ((questionIndex + 1) / (quiz?.questions?.length || 1)) * 100
        });
    };

    const handleSubmitQuiz = async () => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            // Calculate score
            let correctAnswers = 0;
            const review = [];

            quiz.questions.forEach((question, index) => {
                const userAnswer = answers[index];
                const correctAnswer = question.options.findIndex(opt => opt.isCorrect);
                const isCorrect = userAnswer === correctAnswer;
                
                if (isCorrect) correctAnswers++;
                
                review.push({
                    question: question.questionText,
                    userAnswer: userAnswer !== undefined ? question.options[userAnswer]?.option : 'Not answered',
                    correctAnswer: question.options[correctAnswer]?.option,
                    isCorrect
                });
            });

            const scoreData = {
                id: `${id}_${Date.now()}`,
                marks: correctAnswers,
                out_of: quiz.questions.length,
                category: quiz.category,
                quiz: id,
                review,
                taken_by: JSON.parse(localStorage.getItem('user') || '{}')._id
            };

            // Submit score
            const response = await apiCallHelper('/api/scores', 'POST', scoreData);
            
            if (response.data) {
                // Send real-time score update
                socketService.sendScoreUpdate({
                    userId: scoreData.taken_by,
                    quizId: id,
                    score: response.data
                });

                notifyToast.success(`Quiz completed! Score: ${correctAnswers}/${quiz.questions.length}`);
                navigate(`/quiz-result/${response.data._id}`);
            }
        } catch (err) {
            console.error('Error submitting quiz:', err);
            notifyToast.error('Failed to submit quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="quiz-loading">
                <div className="spinner"></div>
                <p>Loading quiz...</p>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="quiz-error">
                <p>Quiz not found</p>
                <button onClick={() => navigate('/quizzes')}>Back to Quizzes</button>
            </div>
        );
    }

    return (
        <div className="real-time-quiz">
            <div className="quiz-header">
                <div className="quiz-info">
                    <h1>{quiz.title}</h1>
                    <p>{quiz.description}</p>
                </div>
                
                <div className="quiz-stats">
                    {timeRemaining > 0 && (
                        <div className="timer">
                            ⏱️ {formatTime(timeRemaining)}
                        </div>
                    )}
                    <div className="participants">
                        👥 {participants} active
                    </div>
                    <div className="progress">
                        {Object.keys(answers).length}/{quiz.questions.length} answered
                    </div>
                </div>
            </div>

            <div className="quiz-content">
                <div className="quiz-main">
                    <div className="question-navigation">
                        {quiz.questions.map((_, index) => (
                            <button
                                key={index}
                                className={`nav-btn ${currentQuestion === index ? 'active' : ''} ${answers[index] !== undefined ? 'answered' : ''}`}
                                onClick={() => setCurrentQuestion(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <div className="question-container">
                        <div className="question-header">
                            <h3>Question {currentQuestion + 1} of {quiz.questions.length}</h3>
                        </div>
                        
                        <div className="question">
                            <p>{quiz.questions[currentQuestion].questionText}</p>
                            
                            <div className="options">
                                {quiz.questions[currentQuestion].options.map((option, optionIndex) => (
                                    <label key={optionIndex} className="option">
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion}`}
                                            value={optionIndex}
                                            checked={answers[currentQuestion] === optionIndex}
                                            onChange={() => handleAnswerChange(currentQuestion, optionIndex)}
                                        />
                                        <span>{option.option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="question-controls">
                            <button
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                            >
                                ← Previous
                            </button>
                            
                            {currentQuestion < quiz.questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitQuiz}
                                    disabled={isSubmitting}
                                    className="submit-btn"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="quiz-sidebar">
                    <div className="leaderboard">
                        <h4>🏆 Live Leaderboard</h4>
                        {leaderboard.length > 0 ? (
                            <div className="leaderboard-list">
                                {leaderboard.map((entry, index) => (
                                    <div key={entry._id} className="leaderboard-entry">
                                        <span className="rank">#{index + 1}</span>
                                        <span className="name">{entry.taken_by?.name || 'Anonymous'}</span>
                                        <span className="score">{entry.marks}/{entry.out_of}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No scores yet. Be the first!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealTimeQuiz;
