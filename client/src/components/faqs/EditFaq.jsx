import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { updateFaq } from '../../redux/slices/faqsSlice'
import { useDispatch } from 'react-redux'
import EditIcon from '../../images/edit.svg'

const EditFaq = ({ faqToEdit }) => {

    // Redux
    const dispatch = useDispatch()

    const [faqState, setFaqState] = useState({
        faqID: faqToEdit._id,
        title: faqToEdit.title,
        answer: faqToEdit.answer
    })


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setFaqState({ ...faqState, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { faqID, title, answer } = faqState

        // VALIDATE
        if (title.length < 4 || answer.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (title.length > 50) {
            notify('Title is too long!')
            return
        }
        else if (answer.length > 100) {
            notify('Answer is too long!')
            return
        }

        // Create new FAQ object
        const updatedFaq = {
            faqID,
            title,
            answer
        }

        // Attempt to update
        dispatch(updateFaq(updatedFaq))
    }
    return (
        <div>
            <NavLink onClick={toggle} className="text-dark p-0">
                <img src={EditIcon} onClick={toggle} alt="" width="16" height="16" className="mx-2" />
            </NavLink>

            <Modal isOpen={modal} toggle={toggle}>
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Edit FAQ
                    <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggle}>
                        X
                    </Button>
                </div>

                <ModalBody>
                    <Form onSubmit={onSubmitHandler}>

                        <FormGroup>

                            <Label for="title">
                                <strong>Title</strong>
                            </Label>

                            <Input type="text" name="title" placeholder="FAQ title ..." className="mb-3" onChange={onChangeHandler} value={faqState.title} />

                            <Label for="answer">
                                <strong>Answer</strong>
                            </Label>

                            <Input type="text" name="answer" placeholder="FAQ answer ..." className="mb-3" onChange={onChangeHandler} value={faqState.answer} />

                            <Button color="success" style={{ marginTop: '2rem' }} block>
                                Update
                            </Button>

                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default EditFaq