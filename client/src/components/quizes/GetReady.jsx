import React, { useEffect, lazy, Suspense } from 'react'
import { Container, Col, Row, Card, Button, CardTitle, CardText } from 'reactstrap'
import { Link, useParams } from 'react-router-dom'
import { getOneQuiz } from '../../redux/slices/quizesSlice'
import { useSelector, useDispatch } from 'react-redux'
import EmbeddedVideos from './EmbeddedVideos'
import QBLoadingSM from '../rLoading/QBLoadingSM'

const ResponsiveHorizontal = lazy(() => import('../adsenses/ResponsiveHorizontal'))

const GetReady = () => {

    // Redux
    const dispatch = useDispatch()
    let qZ = useSelector(state => state.quizes)

    // SHUFFLE QUESTIONS
    const shuffleQuestions = qZ.oneQuiz && qZ.oneQuiz.questions && Array.from(qZ.oneQuiz.questions).sort(() => Math.random() - 0.5)

    qZ = {
        ...qZ,
        oneQuiz: {
            ...qZ.oneQuiz,
            questions: shuffleQuestions
        }
    }

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user

    // Access route parameters
    const { quizSlug } = useParams()

    useEffect(() => {
        dispatch(getOneQuiz(quizSlug))
    }, [dispatch, quizSlug])

    if (qZ.isLoading) {

        return (
            <div className="vh-100 d-flex justify-content-center align-items-center">
                <QBLoadingSM />
            </div>
        )

    } else {

        return (
            qZ.oneQuiz && qZ.oneQuiz.questions.length > 0 ?
                <div className="py-3 d-flex justify-content-center align-items-center flex-column">
                    <Container className="main mx-auto d-flex flex-column justify-content-center rounded my-3 my-lg-5 py-lg-4 w-80">

                        <div className="p-2">
                            <Row>
                                <Col>
                                    <Card body className='question-section text-center my-2 mx-auto w-75 p-2 p-lg-5' style={{ border: '3px solid #157A6E' }}>

                                        <CardTitle tag="h5" className='question-count text-uppercase text-center text-primary fw-bolder'>
                                            {qZ.oneQuiz.title}&nbsp;({qZ.oneQuiz.questions && qZ.oneQuiz.questions.length})
                                        </CardTitle>

                                        <CardText>
                                            {qZ.oneQuiz.description}
                                        </CardText>

                                        <small className={`my-4 fw-bolder text-${currentUser ? 'success' : 'danger'}`}>
                                            {currentUser ? `${currentUser.name}, are you ready to take the quiz?` :
                                                'To be able to save and review your answers, please Login or Register 😎'}
                                        </small>

                                        <div className='answer d-flex justify-content-center mx-auto mt-2 w-lg-50'>
                                            <Link to={`/attempt-quiz/${qZ.oneQuiz.slug}`} state={qZ}>
                                                <Button className="mt-3" style={{ backgroundColor: '#157A6E', color: "fff", border: '2px solid #ffc107', borderRadius: '10px', padding: '5px 12px' }}>
                                                    Attempt Quiz
                                                </Button>
                                            </Link>

                                            <Button color="success" className="mt-3 share-btn mx-1 mx-md-3">
                                                <i className="fa-brands fa-whatsapp"></i>&nbsp;
                                                <a className="text-white" href={`https://api.whatsapp.com/send?phone=whatsappphonenumber&text=Attempt this ${qZ.oneQuiz.title} quiz on Quiz-Blog
                        \nhttps://www.quizblog.rw/view-quiz/${qZ.oneQuiz.slug}`}>Share</a>
                                            </Button>

                                            <Link to={'/'}>
                                                <Button className="mt-3" style={{ backgroundColor: '#ffc107', color: "fff", border: '2px solid #157A6E', borderRadius: '10px', padding: '5px 12px' }}>
                                                    ⬅ Back
                                                </Button>
                                            </Link>
                                        </div>

                                        <small className="mt-3 fw-bolder">
                                            ~{qZ.oneQuiz.category && qZ.oneQuiz.category.title}~
                                        </small>
                                    </Card>

                                    <Suspense fallback={<QBLoadingSM />}>
                                        <div className='w-100'>
                                            {/* Google responsive 1 ad */}
                                            {process.env.NODE_ENV !== 'development' ? <ResponsiveHorizontal /> : null}
                                        </div>
                                    </Suspense>

                                </Col>
                            </Row>
                            <EmbeddedVideos quiz={qZ} />
                        </div>

                    </Container>
                </div> :

                <div className="py-5 d-flex justify-content-center align-items-center">
                    <h4 className="py-lg-5 my-lg-5 text-danger">This quiz is not available yet! <a href="/allposts">click here for more quizes!</a></h4>
                </div>)
    }
}

export default GetReady