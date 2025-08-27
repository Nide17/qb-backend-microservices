import React, { useState, useEffect, useCallback } from 'react'
import { Container, Col, Row, Button } from 'reactstrap'
import { useParams, useLocation } from 'react-router-dom'
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import ReviewView from './ReviewView'
import QuestionComments from './questionComments/QuestionComments'
import OnLastAnswer from './OnLastAnswer'
import TitleRow from './TitleRow'
import NotAuthenticated from '../../auth/NotAuthenticated'
import ResponsiveAd from '../../adsenses/ResponsiveAd'
import SquareAd from '../../adsenses/SquareAd'
import { getOneScore, createScore } from '../../../redux/slices/scoresSlice'
import { useDispatch, useSelector } from 'react-redux'

const ReviewQuiz = () => {

    // Redux
    const dispatch = useDispatch()
    const sC = useSelector(state => state.scores)
    const { isLoading, oneScore } = sC
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const { isAuthenticated } = auth
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [lastAnswer, setLastAnswer] = useState(false)

    const qnsAll = oneScore && oneScore.review && oneScore.review.questions
    const curRevQn = qnsAll && qnsAll[currentQuestion]

    // Access route parameters
    const { reviewId } = useParams()
    const location = useLocation();
    const newScoreToSave = location.state

    // Load the image
    const [imgLoaded, setImgLoaded] = useState(false)
    const onLoad = useCallback(() => { setImgLoaded(true) }, [])
    useEffect(() => { onLoad() }, [onLoad])

    // Lifecycle methods
    useEffect(() => {
        dispatch(getOneScore(reviewId))
    }, [dispatch, reviewId])

    return (

        <Container className='px-lg-5'>

            {isAuthenticated ?
                !isLoading ?
                    <>
                        <Row className='w-100'>
                            <Col sm="6" className='w-100'>
                                <div className='w-100'>
                                    {process.env.NODE_ENV !== 'development' ? <ResponsiveAd /> : null}
                                </div>
                            </Col>
                        </Row>
                        {
                            oneScore ?
                                qnsAll.length > 0 ?
                                    <>
                                        <Row
                                            className="main my-2 mx-auto px-lg-5 d-flex flex-column justify-content-center my-lg-5 py-lg-5 w-80"
                                            key={Math.floor(Math.random() * 1000)}
                                            style={{ border: '3px solid #157A6E', borderRadius: '10px', backgroundColor: '#EAFAF1' }}>

                                            {lastAnswer ?
                                                <OnLastAnswer
                                                    isAuthenticated={auth.isAuthenticated}
                                                    thisQuiz={oneScore.quiz} /> :

                                                imgLoaded ?
                                                    <div className="question-view p-2">
                                                        <TitleRow
                                                            thisQuiz={oneScore.quiz}
                                                            thisReview={oneScore.review}
                                                            score={oneScore.marks}
                                                            qnsAll={qnsAll}
                                                            curRevQn={curRevQn}
                                                            currentQuestion={currentQuestion}
                                                            uRole={currentUser.role} />

                                                        {/* Image */}
                                                        {curRevQn && curRevQn.question_image ?
                                                            <Row>
                                                                <Col>
                                                                    <div className="my-3 mx-sm-5 px-sm-5 d-flex justify-content-center align-items-center">
                                                                        <img
                                                                            className="mt-2 mt-lg-0 mx-sm-5 px-sm-5"
                                                                            src={curRevQn && curRevQn.question_image}
                                                                            onLoad={onLoad}
                                                                            style={{ width: "250px", height: "auto" }}
                                                                            alt="Question Illustration" />
                                                                    </div>
                                                                </Col>
                                                            </Row> : null}

                                                        <ReviewView
                                                            qnsAll={qnsAll}
                                                            curRevQn={curRevQn}
                                                            currentQuestion={currentQuestion}
                                                            lastAnswer={lastAnswer}
                                                            setLastAnswer={setLastAnswer}
                                                            setCurrentQuestion={setCurrentQuestion} />

                                                        <QuestionComments questionID={curRevQn && curRevQn._id} quizID={oneScore.quiz && oneScore.quiz._id} currentUser={auth && currentUser} />
                                                    </div>
                                                    : <QBLoadingSM title='question' />}

                                        </Row>
                                    </> :

                                    <Row className="main mx-auto d-flex flex-column justify-content-center rounded border border-primary my-5 py-4 w-80 text-center">
                                        <h1 className="text-danger fw-bolder">404</h1>
                                        <h4>Quiz's questions unavailable! Refresh!</h4>
                                        <Button color="info" style={{ width: "120px" }} className="mx-auto mt-4"><a href="/dashboard" className="text-white">Back</a></Button>
                                    </Row> :

                                <Row className="main mx-auto d-flex flex-column justify-content-center rounded border border-primary my-5 py-4 w-80 text-center">
                                    <h1 className="text-danger fw-bolder">404</h1>
                                    <h4 className="text-white">
                                        Your score in not saved!
                                    </h4>
                                    <Button color="warning"
                                        className="mx-auto mt-4"
                                        onClick={
                                            async () => {
                                                const scoreCreation = dispatch(createScore(newScoreToSave))
                                                if (scoreCreation) {
                                                    // reload after 3 seconds
                                                    setTimeout(() => {
                                                        window.location.reload()
                                                    }, 3000)
                                                }
                                                else {
                                                    alert('Error saving score!')
                                                }
                                            }
                                        }>
                                        Save your score first!
                                    </Button>

                                    <Button color="dark" style={{ width: "120px" }} className="mx-auto mt-4">
                                        <a href="/dashboard" className="text-white">
                                            Back
                                        </a>
                                    </Button>
                                </Row>}

                        <Row>
                            <Col sm="6">
                                <Row className='w-100'>
                                    <Col sm="12">
                                        <div className='w-100'>
                                            {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row></> :

                    <QBLoadingSM /> :

                <NotAuthenticated auth={auth} />
            }
        </Container>)
}

export default ReviewQuiz