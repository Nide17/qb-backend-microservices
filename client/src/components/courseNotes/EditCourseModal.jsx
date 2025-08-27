import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { updateCourse } from '../../redux/slices/coursesSlice'
import { useDispatch } from 'react-redux'
import EditIcon from '../../images/edit.svg'

const EditCourseModal = ({ idToUpdate, editTitle, editDesc }) => {

    // Redux
    const dispatch = useDispatch()

    const [courseState, setCourseState] = useState({
        idToUpdate,
        name: editTitle,
        description: editDesc,
    })


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setCourseState({ ...courseState, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { idToUpdate, name, description } = courseState

        // VALIDATE
        if (name.length < 4 || description.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (name.length > 80) {
            notify('Title is too long!')
            return
        }
        else if (description.length > 200) {
            notify('Description is too long!')
            return
        }

        // Create new Course object
        const updatedCourse = {
            idToUpdate,
            title: name,
            description
        }

        // Attempt to update
        dispatch(updateCourse(updatedCourse))

    }
    return (
        <div>
            <NavLink onClick={toggle} className="text-dark p-0">
                <img src={EditIcon} onClick={toggle} alt="" width="16" height="16" className="mx-2" />
            </NavLink>

            <Modal
                isOpen={modal}
                toggle={toggle}
            >
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Edit Course
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
                            <Input type="text" name="name" id="name" placeholder="Course title ..." className="mb-3" onChange={onChangeHandler} value={courseState.name} />
                            <Label for="description">
                                <strong>Description</strong>
                            </Label>
                            <Input type="text" name="description" id="description" placeholder="Course description ..." className="mb-3" onChange={onChangeHandler} value={courseState.description} />

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

export default EditCourseModal