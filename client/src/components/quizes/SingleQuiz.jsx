import React, { useEffect, useContext } from 'react'
import { Row, Col, Toast, ToastBody, ToastHeader, Breadcrumb, BreadcrumbItem, ListGroup, ListGroupItem, Button } from 'reactstrap'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import { getQuizes } from '../../redux/slices/quizesSlice'
import { useSelector, useDispatch } from 'react-redux'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { logRegContext } from '../../appContexts'

const SingleQuiz = () => {

    // Redux
    const dispatch = useDispatch()
    const allQuizes = useSelector(state => state.quizes)
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const isAuthenticated = auth && auth.isAuthenticated
    const { toggleL } = useContext(logRegContext)

    // Lifecycle methods
    useEffect(() => {
        dispatch(getQuizes())
    }, [dispatch])

    // Access route parameters
    const { quizId } = useParams()

    // Function to render quiz questions
    const renderQuizQuestions = (quiz) => (
        <Row className="m-4 d-flex justify-content-between align-items-center text-primary">
            {quiz.questions.map(question => (
                <Col sm="4" className="mt-2" key={question._id}>
                    <Toast className="text-center">
                        <ToastHeader className="d-flex justify-content-between">
                            {question.questionText}
                        </ToastHeader>
                        <ToastBody>
                            <ListGroup>
                                {question.answerOptions.map(answer =>
                                    <ListGroupItem color={answer.isCorrect ? 'success' : ''}>
                                        {answer.answerText}
                                    </ListGroupItem>
                                )}
                            </ListGroup>
                            <small>
                                <i>
                                    {moment(new Date(question.creation_date)).format('YYYY-MM-DD, HH:mm')}
                                </i>
                            </small>
                        </ToastBody>
                    </Toast>
                </Col>
            ))}
        </Row>
    );

    return (
        isAuthenticated ? (
            currentUser.role !== 'Visitor' ? (
                <>
                    {allQuizes && allQuizes.map(quiz => (
                        quiz._id === quizId ? (
                            <div className="mt-5 mx-3 mx-lg-5 single-category" key={quiz._id}>
                                <Row className="mb-0 mb-lg-3 mx-0">
                                    <Breadcrumb>
                                        <BreadcrumbItem>
                                            <Link to="/dashboard">{quiz.category.title}</Link>
                                        </BreadcrumbItem>
                                        <BreadcrumbItem active>{quiz.title}</BreadcrumbItem>
                                    </Breadcrumb>
                                </Row>
                                {renderQuizQuestions(quiz)}
                            </div>
                        ) : null
                    ))}
                </>
            ) : (
                <Reports userId={currentUser._id} />
            )
        ) : (
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {auth.isLoading ? (
                    <QBLoadingSM />
                ) : (
                    <Button
                        color="link"
                        className="fw-bolder my-5 border rounded"
                        onClick={toggleL}
                        style={{
                            backgroundColor: "#ffc107",
                            color: "#157A6E",
                            fontSize: "1.5vw",
                            boxShadow: "-2px 2px 1px 2px #157A6E",
                            border: "2px solid #157A6E"
                        }}
                    >
                        Login first
                    </Button>
                )}
            </div>
        )
    );
}

export default SingleQuiz