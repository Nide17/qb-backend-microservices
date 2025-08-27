import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import AddIcon from '../../images/plus.svg'
import { createChapter } from '../../redux/slices/chaptersSlice'
import { useDispatch } from 'react-redux'

const AddChapter = ({ course }) => {

    // Redux
    const dispatch = useDispatch()

    const [chapterState, setChapterState] = useState({
        title: '',
        description: ''
    })

    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setChapterState({ ...chapterState, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { title, description } = chapterState

        // VALIDATE
        if (title.length < 4 || description.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (title.length > 80) {
            notify('Title is too long!')
            return
        }
        else if (description.length > 200) {
            notify('Description is too long!')
            return
        }

        // Create new chapter object
        const newChapter = {
            title,
            description,
            course: course._id,
            courseCategory: course.courseCategory,
            created_by: auth.isLoading === false ? auth.user._id : null
        }

        setProgress(99)

        // Attempt to create
        dispatch(createChapter(newChapter))
    }

    return (
        <div>
            <NavLink onClick={toggle} className="text-success p-0">
                <img src={AddIcon} alt="" width="10" height="10" className="mb-1" />
                &nbsp;Chapter
            </NavLink>

            <Modal
                isOpen={modal}
                toggle={toggle}>

                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Add New Chapter
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

                            <Input type="text" name="title" id="title" placeholder="Chapter title ..." className="mb-3" onChange={onChangeHandler} />

                            <Label for="description">
                                <strong>Description</strong>
                            </Label>

                            <Input type="text" name="description" id="description" placeholder="Chapter description ..." className="mb-3" onChange={onChangeHandler} />

                            <Button color="success" style={{ marginTop: '2rem' }} block >Add</Button>
                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default AddChapter