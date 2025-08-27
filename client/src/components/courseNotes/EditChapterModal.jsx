import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { updateChapter } from '../../redux/slices/chaptersSlice'
import { useDispatch } from 'react-redux'
import EditIcon from '../../images/edit.svg'

const EditChapterModal = ({ idToUpdate, editTitle, editDesc }) => {

    // Redux
    const dispatch = useDispatch()

    const [chapterState, setChapterState] = useState({
        idToUpdate,
        name: editTitle,
        description: editDesc,
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

        const { idToUpdate, name, description } = chapterState

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

        // Create new Chapter object
        const updatedChapter = {
            idToUpdate,
            title: name,
            description
        }

        // Attempt to update
        dispatch(updateChapter(updatedChapter))
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
                    Edit chapter
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

                            <Input type="text" name="name" id="name" placeholder="Chapter title ..." className="mb-3" onChange={onChangeHandler} value={chapterState.name} />

                            <Label for="description">
                                <strong>Description</strong>
                            </Label>

                            <Input type="text" name="description" id="description" placeholder="Chapter description ..." className="mb-3" onChange={onChangeHandler} value={chapterState.description} />

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

export default EditChapterModal