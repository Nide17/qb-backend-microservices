import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { createSchool } from '../../redux/slices/schoolsSlice'
import { useDispatch } from 'react-redux'
import AddIcon from '../../images/plus.svg'

const AddSchool = () => {

    // Redux
    const dispatch = useDispatch()

    const [schoolState, setSchoolState] = useState({
        title: '',
        location: '',
        website: '',
    })


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setSchoolState({ ...schoolState, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { title, location, website } = schoolState
        const websiteTest = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g

        // VALIDATE
        if (title.length < 3 || location.length < 4 || website.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (title.length > 70) {
            notify('Title is too long!')
            return
        }
        else if (location.length > 120) {
            notify('location is too long!')
            return
        }

        else if (!websiteTest.test(website)) {
            notify('Invalid website!')
            return
        }

        // Create new school object
        const newSchool = {
            title,
            location,
            website
        }

        // Attempt to create
        dispatch(createSchool(newSchool))
    }

    return (
        <div>
            <NavLink onClick={toggle} className="text-success p-0">
                <img src={AddIcon} alt="" width="16" height="16" className="mb-1" />
                &nbsp;School
            </NavLink>

            <Modal
                isOpen={modal}
                toggle={toggle}
            >

                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Add New School
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

                            <Input type="text" name="title" id="title" placeholder="School title ..." className="mb-3" onChange={onChangeHandler} required />

                            <Label for="location">
                                <strong>Location</strong>
                            </Label>

                            <Input type="text" name="location" id="location" placeholder="School location ..." className="mb-3" onChange={onChangeHandler} required />

                            <Label for="website">
                                <strong>Website</strong>
                            </Label>

                            <Input type="text" name="website" id="website" placeholder="School website ..." className="mb-3" onChange={onChangeHandler} required />


                            <Button color="success" style={{ marginTop: '2rem' }} block >Add</Button>

                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default AddSchool