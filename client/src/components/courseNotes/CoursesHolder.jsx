import React, { useContext } from 'react'
import { Card, Button, CardTitle, CardText } from 'reactstrap'
import { deleteCourse } from '../../redux/slices/coursesSlice'
import AddChapter from './AddChapter'
import EditCourseModal from './EditCourseModal'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { logRegContext } from '../../appContexts'
import DeleteModal from '../../utils/DeleteModal'

const CoursesHolder = ({ courses }) => {

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const isAuthenticated = useSelector(state => state.auth && state.auth.isAuthenticated)
    const { toggleL } = useContext(logRegContext)

    return (
        isAuthenticated ?
            courses.isByCatLoading ?

                <QBLoadingSM title='courses' /> :

                courses && courses.coursesByCategory.map(course => (
                    <Card key={course._id} className="mb-3" body outline color="warning">
                        <CardTitle tag="h5">{course.title}</CardTitle>
                        <CardText>{course.description}</CardText>

                        <div className="d-flex justify-content-between">
                            <Button className="view-course">
                                <a href={`/view-course/${course._id}`} className="text-white">View Notes</a>
                            </Button>

                            {currentUser.role !== 'Visitor' ?
                                <span>
                                    <Button outline color="warning">
                                        <strong><AddChapter course={course} /></strong>
                                    </Button>

                                    <Button size="sm" color="link" className="mx-2">
                                        <EditCourseModal idToUpdate={course._id} editTitle={course.title} editDesc={course.description} />
                                    </Button>
                                    <DeleteModal deleteFnName="deleteCourse" deleteFn={deleteCourse} delID={course._id} delTitle={course.title} />
                                </span>
                                : null}
                        </div>

                    </Card>)) :

            // If not authenticated or loading
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {
                    auth.isLoading ?
                        <QBLoadingSM /> :
                        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                            Login first
                        </Button>
                }
            </div>
    )
}

export default CoursesHolder