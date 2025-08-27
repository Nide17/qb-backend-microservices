import React, { useEffect, useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap'
import { updateQuestion } from '../../redux/slices/questionsSlice'
import { getQuizesByCategory } from '../../redux/slices/quizesSlice'
import { useSelector, useDispatch } from 'react-redux'


const ChangeQuizModal = ({ questionID, oldQuizID, questionCatID }) => {

    // Redux
    const categoryQuizes = useSelector(state => state.quizes.categoryQuizes)
    const dispatch = useDispatch()

    const [newQuestionState, setNewQuestionState] = useState({ questionID, newQuizID: null })

    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    // Lifecycle methods
    useEffect(() => {
        if (questionCatID) dispatch(getQuizesByCategory(questionCatID))
    }, [questionCatID, dispatch])
    const onChangeHandler = e => setNewQuestionState({ ...newQuestionState, [e.target.name]: e.target.value })

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('newQuiz', newQuestionState.newQuizID)
        formData.append('oldQuizID', oldQuizID)
        formData.append('last_updated_by', auth.isLoading === false ? auth.user._id : null)

        const res = await dispatch(updateQuestion({ questionID: newQuestionState.questionID, formData }))
        if (res.payload) {
            modal && toggle()
            window.location.reload()

        }
    }

    return (

        <div>
            <Button onClick={toggle} color="info" size="sm" className="me-3 p-1 w-100">
                Change Quiz
            </Button>

            <Modal
                isOpen={modal}
                toggle={toggle}
            >
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Change Quiz
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

                            <Input type="select" name="newQuizID" placeholder="Quiz title..." className="mb-3" onChange={onChangeHandler} value={newQuestionState.newQuizID || ''}>

                                {!newQuestionState.newQuizID ?
                                    <option>-- Select a quiz--</option> :
                                    null}

                                {categoryQuizes && categoryQuizes.map(quiz => quiz._id !== oldQuizID &&
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
        </div>
    )
}

export default ChangeQuizModal