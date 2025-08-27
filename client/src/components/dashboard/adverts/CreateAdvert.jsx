import React, { useState } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { createAdvert } from '../../../redux/slices/advertsSlice'
import { useDispatch } from 'react-redux'

const CreateAdvert = () => {

    // Redux
    const dispatch = useDispatch()
    const [advertState, setAdvertState] = useState({
        caption: '',
        phone: '',
        owner: '',
        email: '',
        link: '',
        advert_image: '',
    })


    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onChangeHandler = e => {

        // Add data
        setAdvertState({ ...advertState, [e.target.name]: e.target.value })
    }

    const onFileHandler = (e) => {
        setAdvertState({ ...advertState, advert_image: e.target.files[0] })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { caption, phone, owner, email, link, advert_image } = advertState

        const formData = new FormData()

        // VALIDATE
        if (caption.length < 4 || phone.length < 4 || owner.length < 4 || email.length < 4) {
            notify('Insufficient info!')
            return
        }

        // Create new Notes object
        formData.append('caption', caption)
        formData.append('phone', phone)
        formData.append('owner', owner)
        formData.append('email', email)
        formData.append('link', link)
        formData.append('advert_image', advert_image)

        // Attempt to create
        dispatch(createAdvert(formData))

        // Reset the form
        setAdvertState({
            caption: '',
            phone: '',
            owner: '',
            email: '',
            link: '',
            advert_image: '',
        })
    }

    return (
        <div>
            <NavLink onClick={toggle} className="text-success p-0"><b>+</b> Create Advert</NavLink>

            <Modal isOpen={modal} toggle={toggle}>
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Create Advert
                    <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggle}>
                        X
                    </Button>
                </div>

                <ModalBody>

                    <Form onSubmit={onSubmitHandler}>

                        <FormGroup>

                            <Label for="name">
                                <strong>Caption</strong>
                            </Label>

                            <Input type="text" name="caption" placeholder="Advert caption ..." className="mb-3" onChange={onChangeHandler} value={advertState.caption} />

                            <Label for="owner">
                                <strong>Owner</strong>
                            </Label>

                            <Input type="text" name="owner" placeholder="Advert owner ..." className="mb-3" onChange={onChangeHandler} value={advertState.owner} />

                            <Label for="email">
                                <strong>Email</strong>
                            </Label>

                            <Input type="text" name="email" placeholder="Email ..." className="mb-3" onChange={onChangeHandler} value={advertState.email} />

                            <Label for="link">
                                <strong>Link</strong>
                            </Label>

                            <Input type="text" name="link" placeholder="Link if any ..." className="mb-3" onChange={onChangeHandler} value={advertState.link} />

                            <Label for="phone">
                                <strong>Phone</strong>
                            </Label>

                            <Input type="text" name="phone" placeholder="Phone ..." className="mb-3" onChange={onChangeHandler} value={advertState.phone} />

                            <Label for="advert_image">
                                <strong>Image</strong>
                                <small className="text-info"> (.jpg, .jpeg, .png, .svg)</small>
                            </Label>

                            <Input bsSize="sm" type="file" accept=".jpg, .jpeg, .png, .svg" name="advert_image" onChange={onFileHandler} label="Choose an image to upload ..." id="advert_image" />

                            <Button color="success" style={{ marginTop: '2rem' }} block >
                                Create
                            </Button>

                        </FormGroup>
                    </Form>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default CreateAdvert