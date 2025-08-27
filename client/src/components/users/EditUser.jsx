import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap'
import { updateUser } from '../../redux/slices/authSlice'
import { useDispatch } from 'react-redux'
import EditIcon from '../../images/edit.svg'

const EditUser = ({ uId, uName, uRole, uEmail }) => {

    // Redux
    const dispatch = useDispatch()

    // state
    const [userState, setUserState] = useState({
        uId,
        name: uName,
        role: uRole,
        email: uEmail
    })

    // Alert
    const [visible, setVisible] = useState(true)
    const onDismiss = () => setVisible(false)


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setUserState({ ...userState, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { uId, name, role, email } = userState

        // VALIDATE
        if (name.length < 4 || role.length < 4 || email.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (name.length > 30) {
            notify('Name is too long!')
            return
        }
        else if (role === '') {
            notify('Role is required!')
            return
        }

        // Create new User object
        const updatedUser = {
            uId,
            name,
            role,
            email
        }

        // Attempt to update
        dispatch(updateUser(updatedUser))

        // Display the progress bar
        setProgress(true)
    }
    return (
        <div>
            <img src={EditIcon} onClick={toggle} alt="" width="16" height="16" className="me-3" />

            <Modal
                // Set it to the state of modal true or false
                isOpen={modal}
                toggle={toggle}
            >

                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Edit User
                    <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggle}>
                        X
                    </Button>
                </div>

                <ModalBody>

                    <Form onSubmit={onSubmitHandler}>

                        <FormGroup>

                            <Label for="name">
                                <strong>Name</strong>
                            </Label>

                            <Input type="text" name="name" id="name" placeholder="User name ..." className="mb-3" onChange={onChangeHandler} value={userState.name} />

                            <Label for="role">
                                <strong>Role</strong>
                            </Label>

                            <Input type="select" name="role" placeholder="Category role ..." className="mb-3" onChange={onChangeHandler} value={userState.role}>
                                <option>SuperAdmin</option>
                                <option>Admin</option>
                                <option>Creator</option>
                                <option>Visitor</option>
                            </Input>

                            <Label for="email">
                                <strong>Email</strong>
                            </Label>

                            <Input type="email" name="email" id="email" placeholder="Category email ..." className="mb-3" onChange={onChangeHandler} value={userState.email} />

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

export default EditUser