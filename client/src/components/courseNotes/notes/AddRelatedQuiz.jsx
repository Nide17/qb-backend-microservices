import React, { useEffect, useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap'
import { getQuizesByNotes } from '../../../redux/slices/quizesSlice'
import { addNotesQuizes } from '../../../redux/slices/notesSlice'
import { useSelector, useDispatch } from 'react-redux'
import AddIcon from '../../../images/plus.svg'


const AddRelatedQuiz = ({ noteID, courseCategoryID }) => {

    // Redux
    const dispatch = useDispatch()
    const notesQuizes = useSelector(state => state.quizes.notesQuizes)

    const [quizesState, getQuizesState] = useState()

    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    // Lifecycle methods
    useEffect(() => {
        if (courseCategoryID) {
            dispatch(getQuizesByNotes(courseCategoryID))
        }
    }, [courseCategoryID, dispatch])

    const onChangeHandler = e => {
        getQuizesState(e.target.value)
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const notesQuizzes = {
            noteID,
            quizesState
        }

        // Attempt to update
        dispatch(addNotesQuizes(notesQuizzes))
    }

    return (
        <>
            <Button onClick={toggle} color="warning" size="sm" className="mx-2">
                <img src={AddIcon} alt="" width="10" height="10" className="mb-1" />
                &nbsp; Quizzes
            </Button>

            <Modal isOpen={modal} toggle={toggle}>
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Add Quizzes
                    <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggle}>
                        X
                    </Button>
                </div>

                <ModalBody>
                    <Form onSubmit={onSubmitHandler}>

                        <FormGroup>

                            <Label for="title">
                                <strong>Quiz Title</strong>
                            </Label>

                            <Input type="select" name="quizID" placeholder="Quiz title..." className="mb-3" onChange={onChangeHandler} value={quizesState || ''}>

                                {notesQuizes && notesQuizes.map(quiz =>
                                    <option key={quiz._id} value={quiz._id}>
                                        {quiz.title}
                                    </option>)}
                            </Input>

                            <Button color="success" style={{ marginTop: '2rem' }} block>
                                Save
                            </Button>

                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </>
    )
}

export default AddRelatedQuiz