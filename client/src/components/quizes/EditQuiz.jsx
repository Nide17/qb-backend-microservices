import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap'
import { updateQuiz } from '../../redux/slices/quizesSlice'
import { useDispatch } from 'react-redux'
import EditIcon from '../../images/edit.svg'
import { notify } from '@/utils/notifyToast'
import { useSelector } from 'react-redux'

const EditQuiz = ({ quizToEdit }) => {

    // Redux
    const dispatch = useDispatch()
    const categories = useSelector(state => state.categories)

    const [quizState, setQuizState] = useState({
        quizID: quizToEdit._id,
        name: quizToEdit.title,
        description: quizToEdit.description,
        oldCategoryID: quizToEdit.category && quizToEdit.category._id,
        category: quizToEdit.category && quizToEdit.category._id
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

        const { quizID, name, description, category, oldCategoryID } = quizState

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
        const updatedQuiz = {
            quizID,
            title: name,
            description,
            last_updated_by: auth.isLoading ? null : auth.user._id,
            category,
            oldCategoryID
        }

        // Attempt to update
        dispatch(updateQuiz(updatedQuiz))

        // close the modal
        if (modal) {
            toggle()
        }
    }
    return (

        <div>
            <img src={EditIcon} onClick={toggle} alt="" width="16" height="16" className="mx-3" />
            <Modal isOpen={modal} toggle={toggle}>
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Edit Quiz
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

                            <Input type="text" name="name" id="name" placeholder="Quiz name ..." className="mb-3" onChange={onChangeHandler} value={quizState.name} />

                            <Label for="description">
                                <strong>Description</strong>
                            </Label>

                            <Input type="text" name="description" id="description" placeholder="Category description ..." className="mb-3" onChange={onChangeHandler} value={quizState.description} />

                            <Input type="select" name="category" placeholder="Quiz title..." className="mb-3" onChange={onChangeHandler} value={quizState.category}>

                                {categories && categories.allcategories.map(category =>
                                    <option key={category._id} value={category._id}>
                                        {category.title}
                                    </option>
                                )}

                            </Input>

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

export default EditQuiz