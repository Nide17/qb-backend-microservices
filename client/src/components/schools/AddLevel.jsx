import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { createLevel } from '../../redux/slices/levelsSlice'
import { useDispatch } from 'react-redux'
import AddIcon from '../../images/plus.svg'

const AddLevel = ({ schools }) => {

    // Redux
    const dispatch = useDispatch()

    const [levelState, setLevelState] = useState({
        title: '',
        school: ''
    })


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setLevelState({ ...levelState, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { title, school } = levelState

        // VALIDATE
        if (title.length < 3 || !school) {
            notify('Insufficient info!')
            return
        }
        else if (title.length > 70) {
            notify('Title is too long!')
            return
        }

        // Create new level object
        const newLevel = {
            title,
            school
        }

        // Attempt to create
        dispatch(createLevel(newLevel))
    }

    return (
        <div>
            <NavLink onClick={toggle} className="text-success p-0">
                <img src={AddIcon} alt="" width="12" height="12" className="mb-1" />
                &nbsp; Level
            </NavLink>

            <Modal
                isOpen={modal}
                toggle={toggle}
            >
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Add New Level
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

                            <Input type="text" name="title" id="title" placeholder="Level title ..." className="mb-3" onChange={onChangeHandler} required />

                            <Label for="school">
                                <strong>School</strong>
                            </Label>

                            <Input type="select" name="school" onChange={onChangeHandler}>
                                <option>--Choose a School--</option>
                                {schools.map(school =>
                                    <option key={school._id} value={school._id}>
                                        {school.title}
                                    </option>
                                )}
                            </Input>

                            <Button color="success" style={{ marginTop: '2rem' }} block >Add</Button>

                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </div>
    )
}
export default AddLevel