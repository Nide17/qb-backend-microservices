import React, { useState } from 'react';
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap';
import { updateFaculty } from '../../redux/slices/facultiesSlice'
import { useDispatch } from 'react-redux'
import EditIcon from '../../images/edit.svg'

const EditFacultyModal = ({ idToUpdate, editTitle }) => {

    // Redux
    const dispatch = useDispatch()

    const [facultyState, setFacultyState] = useState({
        idToUpdate,
        title: editTitle,
        years: []
    })


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setFacultyState({ ...facultyState, [e.target.name]: e.target.value });
    }

    const handleSelectYears = (e) => {
        const yearsnbr = []
        for (let i = 1; i <= e.target.value; i++) {
            yearsnbr.push(`Year ${i}`)
        }
        setFacultyState({ ...facultyState, years: yearsnbr });
    }

    const onSubmitHandler = e => {
        e.preventDefault();

        const { idToUpdate, title, years } = facultyState;

        // VALIDATE
        if (title.length < 3 || years.length < 1) {
            notify('Insufficient info!');
            return
        }
        else if (title.length > 70) {
            notify('Title is too long!');
            return
        }

        // Create new faculty object
        const updatedFac = {
            idToUpdate,
            title,
            years
        }

        // Attempt to create
        dispatch(updateFaculty(updatedFac));
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
                    Edit Faculty
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

                            <Input value={facultyState.title} type="text" name="title" id="title" className="mb-3" onChange={onChangeHandler} required />

                            <Label for="years">
                                <strong>Learning years</strong>
                            </Label>

                            <Input type="select" name="selectYear" onChange={handleSelectYears}>
                                <option>-- Select --</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                <option value={6}>6</option>
                            </Input>

                            <Button color="success" style={{ marginTop: '2rem' }} block >Update</Button>

                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default EditFacultyModal