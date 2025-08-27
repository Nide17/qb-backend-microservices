import React, { useEffect, lazy, Suspense, useContext } from 'react'
import { Container, Col, Row, Card, Button, CardTitle, CardText } from 'reactstrap'
import { Link, useParams } from 'react-router-dom'
import moment from 'moment'
import { getOneNotePaper } from '../../../redux/slices/notesSlice'
import { saveDownload } from '../../../redux/slices/downloadsSlice'
import { useSelector, useDispatch } from 'react-redux'
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import { logRegContext } from '../../../appContexts'

const GridMultiplex = lazy(() => import('../../adsenses/GridMultiplex'))

const ViewNotePaper = () => {

    // Redux
    const dispatch = useDispatch()
    const nPaper = useSelector(state => state.notes)
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user

    const { toggleL } = useContext(logRegContext)

    // Access route parameters
    const { noteSlug } = useParams()

    useEffect(() => {
        dispatch(getOneNotePaper(noteSlug))
    }, [dispatch, noteSlug])

    const { title, description, courseCategory, course, chapter, notes_file, createdAt } = nPaper.oneNotePaper

    const onDownload = (note) => {

        const newDownload = {
            notes: note._id,
            chapter: note.chapter,
            course: note.course,
            courseCategory: note.courseCategory,
            downloaded_by: currentUser ? currentUser._id : null
        }

        dispatch(saveDownload(newDownload))
    }

    return (
        nPaper.isOneNotePaperLoading ?

            <QBLoadingSM /> :

            notes_file && notes_file ?

                <Container className="main mx-auto d-flex flex-column justify-content-center rounded border border-primary my-5 py-4 w-80">

                    <div className="question-view p-2">
                        <Row>
                            <Col>
                                <Card body className='question-section text-center my-2 mx-auto w-75'>
                                    <CardTitle tag="h5" className='question-count text-uppercase text-center text-secondary fw-bolder'>
                                        ({title})
                                    </CardTitle>

                                    <CardText>{description}</CardText>

                                    <small className='text-center text-info fw-bolder'>
                                        {moment(new Date(createdAt)).format('DD MMM YYYY, HH:mm')}
                                    </small>

                                    {!auth.isAuthenticated ?

                                        // If not authenticated or loading
                                        <div className="d-flex justify-content-center align-items-center text-danger">
                                            {
                                                auth.isLoading ?
                                                    <QBLoadingSM /> :
                                                    <Button className="btn btn-outline-primary mt-3" onClick={toggleL}>
                                                        Login to download
                                                    </Button>
                                            }
                                        </div> :

                                        <div className='answer d-flex justify-content-center mx-auto mt-2 w-lg-50'>

                                            <a href={notes_file} target="_blank" rel="noopener noreferrer">
                                                <Button className="btn btn-outline-primary mt-3" onClick={() => onDownload(nPaper && nPaper.oneNotePaper)}>
                                                    Download
                                                </Button>
                                            </a>

                                            <Link to={'/'}>
                                                <Button className="btn btn-outline-primary mt-3">
                                                    Back
                                                </Button>
                                            </Link>
                                        </div>
                                    }

                                    <small className="mt-3 text-info">
                                        ~
                                        {courseCategory && courseCategory.title} |
                                        {course && course.title} |
                                        {chapter && chapter.title}
                                        ~
                                    </small>

                                </Card>

                            </Col>
                        </Row>

                        <Row>
                            <Col sm="12">
                                <Suspense fallback={<QBLoadingSM />}>
                                    {process.env.NODE_ENV !== 'development' ? <GridMultiplex /> : null}
                                </Suspense>
                            </Col>
                        </Row>
                    </div>
                </Container> :

                <div className="pt-5 d-flex justify-content-center align-items-center">
                    <h4>This file is unavailable!</h4>
                    <Link to={'/'}>
                        <Button className="btn btn-outline-primary mt-3">
                            Go back
                        </Button>
                    </Link>
                </div>)
}

export default ViewNotePaper