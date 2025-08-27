import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import AddIcon from '../../images/plus.svg'
import { createQuiz } from '../../redux/slices/quizesSlice'
import { useDispatch } from 'react-redux'


const AddQuiz = ({ category }) => {

    // Redux
    const dispatch = useDispatch()
    const [quizState, setQuizState] = useState({
        name: '',
        description: ''
    })

    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setQuizState({ ...quizState, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { name, description } = quizState

        // VALIDATE
        if (name.length < 4 || description.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (name.length > 70) {
            notify('Title is too long!')
            return
        }
        else if (description.length > 120) {
            notify('Description is too long!')
            return
        }

        // Create new Quiz object
        const newQuiz = {
            title: name,
            description,
            category: category._id,
            created_by: auth.isLoading === false ? auth.user._id : null
        }

        // Attempt to create
        dispatch(createQuiz(newQuiz))
    }

    return (
        <div>
            <NavLink onClick={toggle} className="p-0 d-flex justify-center align-items-center">
                <img src={AddIcon} alt="" width="10" height="10" className="fw-bolder" />
                &nbsp; Add Quiz
            </NavLink>

            <Modal
                isOpen={modal}
                toggle={toggle}
            >
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Add {category.title} Quiz
                    <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggle}>
                        X
                    </Button>
                </div>

                <ModalBody>
                    <Form onSubmit={onSubmitHandler}>

                        <FormGroup>

                            <Label for="name">
                                <strong>Title</strong>
                            </Label>

                            <Input type="text" name="name" id="name" placeholder="Quiz name ..." className="mb-3" onChange={onChangeHandler} />

                            <Label for="description">
                                <strong>Description</strong>
                            </Label>

                            <Input type="text" name="description" id="description" placeholder="Quiz description ..." className="mb-3" onChange={onChangeHandler} />

                            <Button color="success" style={{ marginTop: '2rem' }} block >Add</Button>

                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default AddQuiz