import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Container } from 'reactstrap'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { createScore } from '../../redux/slices/scoresSlice'
import { useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import QuestionsView from './QuestionsView'
import NoQuestions from './questionsScore/NoQuestions'
import Unavailable from './questionsScore/Unavailable'
import { useSelector } from "react-redux"

const QuizQuestions = () => {

    // Redux
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user

    // Access route parameters & get the quiz
    const { quizSlug } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    // ACCESS Link Tag State
    const quizState = location.state

    // Get the quiz
    const [newScoreId, setNewScoreId] = useState();

    // Question setup
    const thisQuiz = quizState && quizState.oneQuiz
    const qnsLength = thisQuiz && thisQuiz.questions && thisQuiz.questions.length
    const [curQnIndex, setCurQnIndex] = useState(0)
    const currentQn = thisQuiz && thisQuiz.questions[curQnIndex]
    const curQnOpts = currentQn && currentQn.answerOptions

    // Dealing with answers
    const trueAnsNbr = curQnOpts && curQnOpts.filter(aOpt => aOpt.isCorrect === true).length

    // Checked and User choices
    const [selected, setSelected] = useState('')
    const [checkedState, setCheckedState] = useState([])
    useEffect(() => { curQnOpts && setCheckedState(new Array(curQnOpts.length).fill(false)) }, [curQnOpts])

    const [choices, setChoices] = useState(0)
    const [curQnUsrTrueChoices, setCurQnUsrTrueChoices] = useState(0)
    useEffect(() => { selected && setChoices(selected.filter(value => value).length) }, [selected])
    useEffect(() => { selected && setCurQnUsrTrueChoices(selected.filter(value => (value === 'true')).length) }, [selected])

    // Review
    const [quizToReview, setQuizToReview] = useState({})
    const passMark = thisQuiz && thisQuiz.category && thisQuiz.category._id === '60e9a2ba82f7830015c317f1' ? 80 : 50

    // Function to change selected answer
    const handleOnChange = (event, position) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item)

        setCheckedState(updatedCheckedState)

        const selectedAnswer = updatedCheckedState.map(

            (curSelState, index) => {
                var ansArr = ''
                if (curSelState === true) {
                    return ansArr + curQnOpts[index].isCorrect
                }
                return ansArr
            })

        setSelected(selectedAnswer)

        // Review answers
        curQnOpts
            .forEach(opt => {
                if (event && event.target.value === opt.answerText) {
                    if (opt.choosen === undefined)
                        opt.choosen = true
                    else if (opt.choosen === true)
                        opt.choosen = false
                    else if (opt.choosen === false)
                        opt.choosen = true
                }
                else {
                    if (opt.choosen === undefined) {
                        opt.choosen = false
                    }
                }
            })

        // Preparing the review
        setQuizToReview({
            ...quizToReview,
            id: uuidv4(),
            title: thisQuiz.title,
            description: thisQuiz.description,
            questions: thisQuiz.questions
        })
        setNewScoreId(uuidv4())
    }

    const [saveScoreLoading, setSaveScoreLoading] = useState(false)

    // Save score to database function
    const scoreToSave = useMemo(() => {

        const marks = quizToReview && quizToReview.questions && quizToReview.questions
            .map(qn => {
                const correctOptions = qn.answerOptions.filter(opt => opt.isCorrect === true);
                const chosenCorrectOptions = qn.answerOptions.filter(opt => opt.choosen === true && opt.isCorrect === true);

                // Calculate marks for the question based on the ratio of correct chosen options to total correct options
                if (correctOptions.length > 0) {
                    const ratio = chosenCorrectOptions.length / correctOptions.length;
                    return isNaN(ratio) ? 0 : ratio;
                }
                else
                    return 0; // Handle the case where there are no correct options (optional)
            })
            .reduce((a, b) => a + b, 0);

        return {
            id: newScoreId,
            marks: Math.floor(marks),
            out_of: qnsLength,
            category: thisQuiz && thisQuiz.category && thisQuiz.category._id,
            quiz: thisQuiz && thisQuiz._id,
            review: quizToReview,
            taken_by: currentUser && currentUser._id
        }
    }, [currentUser, thisQuiz, qnsLength, quizToReview, newScoreId])

    const saveScore = useCallback(async () => {

        // SET LOADING
        setSaveScoreLoading(true)

        // ATTEMPT TO SAVE SCORE
        try {
            // SAVE SCORE ONLY IF USER IS LOGGED IN
            if (currentUser._id) {
                const scoreSaving = await dispatch(createScore(scoreToSave)).unwrap()

                if (scoreSaving) {
                    setSaveScoreLoading(false)
                    return scoreSaving._id
                }
                else {
                    setSaveScoreLoading(false)
                    return null
                }
            }

            // IF USER IS NOT LOGGED IN
            else {
                setSaveScoreLoading(false)
                return null
            }

        } catch (err) {
            setSaveScoreLoading(false)
            return null
        }

    }, [currentUser, dispatch, scoreToSave])

    // Going to next question
    const goToNextQuestion = useCallback((currentIndex, QuestionsLength) => {

        // REVIEW ANSWERS
        const reviewDetails = { review: quizToReview && quizToReview }

        // NAVIGATE TO NEXT QUESTION
        if (currentIndex + 1 < QuestionsLength)
            setCurQnIndex(currentIndex + 1)

        else {
            // CALCULATE THE SCORE FROM THE ANSWERS - reviewDetails.review.questions
            const marks = reviewDetails.review && reviewDetails.review.questions && reviewDetails.review.questions
                .map(qn => {

                    const correctOptions = qn.answerOptions.filter(opt => opt.isCorrect === true);
                    const chosenCorrectOptions = qn.answerOptions.filter(opt => opt.choosen === true && opt.isCorrect === true);

                    // Calculate marks for the question based on the ratio of correct chosen options to total correct options
                    if (correctOptions.length > 0) {
                        const ratio = chosenCorrectOptions.length / correctOptions.length;
                        return isNaN(ratio) ? 0 : ratio;
                    }
                    else
                        return 0; // Handle the case where there are no correct options (optional)
                })
                .reduce((a, b) => a + b, 0);

            // SAVE SCORE
            saveScore().then(scoreId => {

                // NAVIGATE TO QUIZ RESULTS
                navigate(`/quiz-results/${quizSlug}`, {
                    state: {
                        score: Math.floor(marks),
                        qnsLength: QuestionsLength,
                        passMark,
                        thisQuiz,
                        quizToReview: reviewDetails.review,
                        newScoreId,
                        review: quizToReview,
                        mongoScoreId: scoreId
                    }
                })
            })
        }
    }, [quizToReview, passMark, thisQuiz, navigate, quizSlug, newScoreId, saveScore])


    useEffect(() => {
        if (trueAnsNbr === choices) {
            setCheckedState([])
            setSelected('')
            setChoices(0)
            setCurQnUsrTrueChoices(0)
            goToNextQuestion(curQnIndex, qnsLength)
        }

        // clean up the saving score
        return () => setSaveScoreLoading(false)

    }, [trueAnsNbr, choices, curQnUsrTrueChoices, curQnIndex, qnsLength, goToNextQuestion])

    if (!quizState.isOneQuizLoading) {

        return (
            thisQuiz ?
                qnsLength > 0 ?

                    <div key={Math.floor(Math.random() * 1000)} className="py-3 d-flex justify-content-center align-items-center flex-column">
                        <Container className="main mx-auto d-flex flex-column justify-content-center rounded border border-primary my-5 py-4 w-80">
                            <QuestionsView
                                qnsLength={qnsLength}
                                curQnIndex={curQnIndex}
                                currentQn={currentQn}
                                curQnOpts={curQnOpts}
                                checkedState={checkedState}
                                selected={selected}
                                handleOnChange={handleOnChange}
                                goToNextQuestion={goToNextQuestion}
                                setCurQnIndex={setCurQnIndex} />
                        </Container>
                    </div> :

                    <NoQuestions /> :

                <Unavailable title='Quiz' link='/allposts' more='quizes' />
        )
    }

    else if (saveScoreLoading)
        return (<QBLoadingSM />)

    else
        return (<QBLoadingSM />)
}

export default QuizQuestions