import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { createFaculty } from '../../redux/slices/facultiesSlice'
import { useDispatch } from 'react-redux'
import AddIcon from '../../images/plus.svg'

const AddFaculty = ({ facultyLevel }) => {

    // Redux
    const dispatch = useDispatch()

    const [facultyState, setFacultyState] = useState({
        title: '',
        school: facultyLevel && facultyLevel.school,
        level: facultyLevel && facultyLevel._id,
        years: []
    })


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setFacultyState({ ...facultyState, [e.target.name]: e.target.value })
    }

    const handleSelectYears = (e) => {
        const yearsnbr = []
        for (let i = 1; i <= e.target.value; i++) {
            yearsnbr.push(`Year ${i}`)
        }
        setFacultyState({ ...facultyState, years: yearsnbr });
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { title, school, level, years } = facultyState

        // VALIDATE
        if (title.length < 3 || !years) {
            notify('Insufficient info!')
            return
        }
        else if (title.length > 70) {
            notify('Title is too long!')
            return
        }

        // Create new faculty object
        const newFaculty = {
            title,
            school,
            level,
            years
        }

        // Attempt to create
        dispatch(createFaculty(newFaculty))
    }

    return (
        <div>
            <NavLink onClick={toggle} className="text-success p-0">
                <img src={AddIcon} alt="" width="12" height="12" className="mb-1" />
                &nbsp;Faculty
            </NavLink>

            <Modal
                isOpen={modal}
                toggle={toggle}
            >
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Add New Faculty
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

                            <Input type="text" name="title" id="title" placeholder="Faculty title ..." className="mb-3" onChange={onChangeHandler} required />

                            <Label for="faculty">
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

                            <Button color="success" style={{ marginTop: '2rem' }} block >Add</Button>

                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default AddFaculty