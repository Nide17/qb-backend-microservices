import React, { useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { getNotes, deleteNotes, removeQzNt } from '../../../redux/slices/notesSlice'
import { saveDownload } from '../../../redux/slices/downloadsSlice'
import { useSelector, useDispatch } from 'react-redux'
import img from '../../../images/resourceImg.svg'
import DeleteIcon from '../../../images/trash.svg'
import AddNotesModal from './AddNotesModal'
import EditNotesModal from './EditNotesModal'
import AddRelatedQuiz from './AddRelatedQuiz'
import { Row, Col, Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button } from 'reactstrap'
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import { logRegContext } from '../../../appContexts'
import DeleteModal from '../../../utils/DeleteModal'

const CourseNotes = ({ chapter }) => {

    // Redux
    const notes = useSelector(state => state.notes)
    const dispatch = useDispatch()

    const auth = useSelector(state => state.auth)
    const isAuth = auth && isAuthenticated
    const currentUser = auth && auth.user
    const { toggleL } = useContext(logRegContext)

    useEffect(() => { dispatch(getNotes()) }, [dispatch])

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

        isAuth && isAuth ?

            notes.isLoading ?
                <QBLoadingSM title='notes' /> :

                <>
                    {currentUser.role !== 'Visitor' ?
                        <Row>
                            {chapter ?
                                <Button size="sm" outline color="success" className="ms-auto me-1 mx-sm-auto my-2 add-notes-btn">
                                    <strong><AddNotesModal chapter={chapter} /></strong>
                                </Button> : null
                            }
                        </Row> : null}

                    <Row>
                        {notes && notes.allNotes.map(note =>

                            note.chapter === chapter._id ?

                                <Col key={note._id} sm="12" className="mb-3 resouces-card c-notes">

                                    <Card className="d-flex flex-row p-1 p-sm-4">
                                        <CardImg top width="12%" src={img} alt="Card image cap" className="pl-1" />
                                        <CardBody style={{ width: "77%" }}>

                                            <CardTitle tag="h6" className="text-info fw-bolder mb-1"
                                                style={{ fontSize: ".7rem" }}>
                                                {note.title}
                                            </CardTitle>

                                            <CardSubtitle tag="small" className="mb-2 text-muted fw-bolder" style={{ fontSize: ".6rem" }}>
                                                {note.courseCategory.title}
                                            </CardSubtitle>

                                            <CardText className="mb-1">
                                                <small>{note.description}</small>
                                                <br />
                                                <i className="fw-bolder text-info" style={{ fontSize: ".5rem" }}>
                                                    {note.notes_file && note.notes_file.split('/').pop().replace(/%20|%5B|%5D/g, ' ')}
                                                </i>
                                            </CardText>

                                            {note.quizzes && note.quizzes.length > 0 ?
                                                <>
                                                    <h6 style={{ fontSize: ".7rem", fontWeight: "bolder", marginTop: "1rem", color: "magenta" }}>
                                                        <u>RELATED QUIZZES</u>
                                                    </h6>

                                                    <ol style={{ fontSize: ".65rem" }}>
                                                        {
                                                            note.quizzes && note.quizzes.map(qz =>
                                                                <li key={qz && qz._id}>
                                                                    <Link to={`/view-quiz/${qz && qz.slug}`}>
                                                                        {qz.title}
                                                                    </Link>

                                                                    {currentUser.role !== 'Visitor' ?
                                                                        <Button size="sm" color="link" className="ms-2" onClick={() => dispatch(removeQzNt(note._id, qz && qz._id))}>
                                                                            <img src={DeleteIcon} alt="" width="10" height="10" />
                                                                        </Button> : null}
                                                                </li>
                                                            )
                                                        }
                                                    </ol></> : null}

                                            <div className="d-flex">
                                                <Button size="sm" style={{ backgroundColor: "#ffc107", border: "2px solid #157A6E" }}>
                                                    <a href={note.notes_file} style={{ color: "#157A6E", fontWeight: 'bold' }} onClick={() => onDownload(note)} target="_blank" rel="noopener noreferrer">Download</a>
                                                </Button>

                                                {currentUser.role !== 'Visitor' ?
                                                    <><Button size="sm" color="link" className="mx-2">
                                                        <EditNotesModal idToUpdate={note._id} editTitle={note.title} editDesc={note.description} />
                                                    </Button>
                                                        <DeleteModal deleteFnName="deleteNotes" deleteFn={deleteNotes} delID={note._id} delTitle={note.title} />
                                                        <AddRelatedQuiz courseCategoryID={note.courseCategory} noteID={note._id} /></> : null}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col> : null)}
                    </Row>
                </> :

            // If not authenticated or loading
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {
                    auth.isLoading ?
                        <QBLoadingSM /> :
                        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                            Login first
                        </Button>
                }
            </div>)
}

export default CourseNotes