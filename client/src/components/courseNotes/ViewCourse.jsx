import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'

import CourseNotes from './notes/CourseNotes'
import AddChapter from './AddChapter'
import EditChapterModal from './EditChapterModal'
import { getChaptersByCourse, deleteChapter } from '../../redux/slices/chaptersSlice'
import { getOneCourse } from '../../redux/slices/coursesSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Container, Card, Button, CardTitle, CardText, Alert, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { logRegContext } from '../../appContexts'
import DeleteModal from '../../utils/DeleteModal'

const ViewCourse = () => {

    const dispatch = useDispatch()
    const chaptersBy = useSelector(state => state.chapters)
    const oneCourse = useSelector(state => state.courses)
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const { toggleL } = useContext(logRegContext)

    const [activeIndex, setActiveIndex] = useState(null)

    const collapse = index => {
        if (activeIndex !== index) setActiveIndex(index)
    }

    // Access route parameters
    const { courseId } = useParams()

    useEffect(() => {
        dispatch(getChaptersByCourse(courseId))
        dispatch(getOneCourse(courseId))
    }, [dispatch, courseId])

    return (

        !auth.isAuthenticated ?
            // If not authenticated or loading
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {
                    auth.isLoading ?
                        <QBLoadingSM /> :
                        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                            Login first
                        </Button>
                }
            </div> :

            <Container className="mt-2 py-2 py-lg-5 view-course-container">
                <Alert color="success" style={{ backgroundColor: "#157A6E", border: "1px solid #157A6E", color: "#fff" }}>
                    <Breadcrumb tag="nav" listTag="div">
                        <>
                            <BreadcrumbItem tag="a" href="/course-notes" style={{ color: "#fff", fontWeight: "bold" }}>
                                Courses Home
                            </BreadcrumbItem>

                            <BreadcrumbItem active tag="span" style={{ color: "#E5E7E9" }}>
                                Chapters
                            </BreadcrumbItem>
                        </>
                        {currentUser.role !== 'Visitor' ?
                            <Button outline color="warning" className="ms-auto">
                                <strong><AddChapter course={oneCourse.oneCourse} /></strong>
                            </Button> : null}

                    </Breadcrumb>

                    <h4 className="alert-heading">
                        {oneCourse && oneCourse.oneCourse.title} course
                    </h4>

                    <hr />
                    <p className="mb-0">
                        {oneCourse && oneCourse.oneCourse.description}
                    </p>
                </Alert>


                {!chaptersBy.isByCourseLoading ?

                    chaptersBy.chaptersByCourse.length > 0 ?

                        chaptersBy.chaptersByCourse.map((chapter, index) => (

                            <Card key={chapter._id} className="mb-3 text-capitalize chapter-card" body style={{ minHeight: "fit-content", border: "2px solid #157A6E" }}>

                                <CardTitle tag="h5" className="fw-bolder mb-0 d-flex">
                                    Chapter - {index + 1}.&nbsp;{chapter.title}
                                    {currentUser.role !== 'Visitor' ?

                                        <span className="ms-auto">
                                            <Button size="sm" color="link" className="mx-2">
                                                <EditChapterModal idToUpdate={chapter._id} editTitle={chapter.title} editDesc={chapter.description} />
                                            </Button>
                                            <DeleteModal deleteFnName="deleteChapter" deleteFn={deleteChapter} delID={chapter._id} delTitle={chapter.title} />
                                        </span> : null}
                                </CardTitle>

                                <CardText className="text-muted">{chapter.description}</CardText>

                                <div id="accordion">
                                    <div className="card border-0">
                                        <div className="card-header" id={`heading${index}`}>
                                            <h5 className="mb-0">

                                                <Button block outline color="info" size="sm" index={index} onClick={() => { collapse(index) }} className={`d-flex justify-content-between ${(activeIndex === index || activeIndex === null) ? '' : 'collapsed'}`} data-toggle="collapse" data-target={`#collapse${index}`} aria-expanded={(activeIndex === index || activeIndex === null)} aria-controls={`collapse${index}`}>

                                                    <span className="me-auto">Course notes</span>

                                                    <i className={`fa fa-angle-${(activeIndex === index || activeIndex === null) ? 'up' : 'down'} ms-auto`}></i>
                                                </Button>
                                            </h5>
                                        </div>

                                        <div id={`collapse${index}`} className={`collapse ${(activeIndex === index || activeIndex === null) ? 'show' : ''}`} aria-labelledby={`heading${index}`} data-parent="#accordion">
                                            <div className="card-body">
                                                <CourseNotes chapter={chapter} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </Card>)) :

                        <Alert color="danger" className="d-flex justify-content-between" style={{ border: "1px solid #157A6E" }}>
                            <strong>No chapters yet for this course!</strong>
                            {currentUser.role !== 'Visitor' ?
                                <Button outline color="success">
                                    <strong><AddChapter course={oneCourse.oneCourse} /></strong>
                                </Button> : null}
                        </Alert> :
                    <QBLoadingSM />
                }

            </Container>)
}

export default ViewCourse