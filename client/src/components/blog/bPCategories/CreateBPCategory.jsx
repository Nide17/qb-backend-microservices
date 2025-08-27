import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { createPostCategory } from '../../../redux/slices/postCategoriesSlice'
import { useDispatch } from "react-redux"

const CreateBPCategory = () => {

    const dispatch = useDispatch()
    const [bPCategoryState, setBPCategoryState] = useState({
        title: '',
        description: ''
    })

    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        // Add data
        setBPCategoryState({ ...bPCategoryState, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { title, description } = bPCategoryState

        // VALIDATE
        if (title.length < 4 || description.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (title.length > 50) {
            notify('Title is too long!')
            return
        }
        else if (description.length > 100) {
            notify('Description is too long!')
            return
        }

        // Create new Category object
        const newBPCategory = {
            title,
            description,
            creator: auth.isLoading === false ? auth.user._id : null
        }

        // Attempt to create
        dispatch(createPostCategory(newBPCategory))

        // Reset the form
        setBPCategoryState({
            title: '',
            description: ''
        })
    }

    return (
        <div>
            <NavLink onClick={toggle} className="text-success p-0"><b>+</b> BP Category</NavLink>
            <Modal isOpen={modal} toggle={toggle}>
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Create Blog Post Category
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

                            <Input type="text" name="title" id="title" placeholder="Category title ..." className="mb-3" onChange={onChangeHandler} />

                            <Label for="description">
                                <strong>Description</strong>
                            </Label>

                            <Input type="text" name="description" id="description" placeholder="Category description ..." className="mb-3" onChange={onChangeHandler} />

                            <Button color="success" style={{ marginTop: '2rem' }} block >
                                Create
                            </Button>

                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default CreateBPCategory
