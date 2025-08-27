import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { updateNotes } from '../../../redux/slices/notesSlice'
import { useDispatch } from 'react-redux'
import EditIcon from '../../../images/edit.svg'

const EditNotesModal = ({ idToUpdate, editTitle, editDesc }) => {

    // Redux
    const dispatch = useDispatch()

    const [notesState, setNotesState] = useState({
        idToUpdate,
        name: editTitle,
        description: editDesc,
        notes_file: ''
    })


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setNotesState({ ...notesState, [e.target.name]: e.target.value })
    }

    const onFileHandler = (e) => {
        setNotesState({ ...notesState, notes_file: e.target.files[0] })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const formData = new FormData()
        const { idToUpdate, name, description, notes_file } = notesState

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

        // Create Notes object
        formData.append('title', name)
        formData.append('description', description)
        formData.append('notes_file', notes_file)

        // Attempt to update
        dispatch(updateNotes({ formData, idToUpdate }))
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
                    Edit Notes
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

                            <Input type="text" name="name" id="name" placeholder="Notes title ..." className="mb-3" onChange={onChangeHandler} value={notesState.name} />

                            <Label for="description">
                                <strong>Description</strong>
                            </Label>

                            <Input type="text" name="description" id="description" placeholder="Notes description ..." className="mb-3" onChange={onChangeHandler} value={notesState.description} />

                            <Label for="notes_file" className="my-2">
                                <strong>Upload</strong>&nbsp;
                                <small className="text-info">.pdf, .doc, .docx, .ppt, .pptx</small>
                            </Label>

                            <Input bsSize="sm" type="file" accept=".pdf, .doc, .docx, .ppt, .pptx" name="notes_file" onChange={onFileHandler} label="Pick a file ..." id="notes_file_pick" />

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

export default EditNotesModal