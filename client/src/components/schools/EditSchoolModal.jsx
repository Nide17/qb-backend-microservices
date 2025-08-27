import React, { useState, useEffect } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { getOneSchool, updateSchool } from '../../redux/slices/schoolsSlice'
import { useSelector, useDispatch } from 'react-redux'
import EditIcon from '../../images/edit.svg'

const EditSchoolModal = ({ idToUpdate }) => {

    // Redux
    const oneSchool = useSelector(state => state.schools.oneSchool)
    const dispatch = useDispatch()

    // Get school to update
    useEffect(() => { dispatch(getOneSchool(idToUpdate)) }, [dispatch, idToUpdate])
    const [schoolTitleState, setSchoolTitleState] = useState('')
    useEffect(() => { setSchoolTitleState(oneSchool && oneSchool.title) }, [oneSchool])


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {
        setSchoolTitleState({ [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { title } = schoolTitleState

        // VALIDATE
        if (title.length < 3) {
            notify('Insufficient info!')
            return
        }
        else if (title.length > 70) {
            notify('Title is too long!')
            return
        }

        // update school object
        const updatedSchool = {
            idToUpdate,
            title
        }

        // Attempt to create\
        dispatch(updateSchool(updatedSchool))
    }

    return (
        <div>
            <NavLink onClick={toggle} className="text-dark p-0">
                <img src={EditIcon} alt="" width="14" height="14" />
            </NavLink>
            <Modal
                isOpen={modal}
                toggle={toggle}
            >

                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Edit School
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

                            <Input value={schoolTitleState} type="text" name="title" id="title" className="mb-3" onChange={onChangeHandler} required />
                            <Button color="success" style={{ marginTop: '2rem' }} block >Update</Button>

                        </FormGroup>

                    </Form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default EditSchoolModal