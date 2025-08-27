import React, { useState } from 'react'
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import { createImageUpload } from '../../../redux/slices/imageUploadsSlice'
import { useDispatch, useSelector } from "react-redux"

const UploadPostPhotos = () => {

    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const [imageDetailsState, setImageDetailsState] = useState({
        imageTitle: '',
        owner: currentUser._id
    })

    const [uploadImage, setUploadImage] = useState('')
    const onChangeHandler = e => {
        setImageDetailsState({ ...imageDetailsState, [e.target.name]: e.target.value })
    }

    const onFileHandler = (e) => {
        setUploadImage(e.target.files[0])
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const formData = new FormData()
        const { imageTitle, owner } = imageDetailsState

        // VALIDATE
        if (imageTitle.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (imageTitle.length > 70) {
            notify('Image title is too long!')
            return
        }

        // Create new BP object
        formData.append('imageTitle', imageTitle)
        formData.append('uploadImage', uploadImage)
        formData.append('owner', owner)

        // Attempt to create
        dispatch(createImageUpload(formData))

        // Reset form fields
        setImageDetailsState({
            imageTitle: ''
        })
        setUploadImage('')
    }

    return (
        <div>

            <Form onSubmit={onSubmitHandler}>

                <Label for="imageTitle">
                    <strong className='text-success'>Image name</strong>
                </Label>

                <Input type="text" name="imageTitle" placeholder="Image title ..." className="mb-3" onChange={onChangeHandler} value={imageDetailsState.imageTitle || ''} required />

                <FormGroup>
                    <Label for="uploadImage">
                        <strong className='text-success'>Image</strong>&nbsp;
                        <small className="text-info">.jpg, .png, .jpeg, .svg</small>
                    </Label>

                    <Input bsSize="sm" type="file" accept=".jpg, .png, .jpeg, .svg" name="uploadImage" onChange={onFileHandler} label="Pick an image ..." id="uploadImage_pick" required />

                    <Button color="success" style={{ marginBottom: '3rem', marginTop: '.8rem' }} block >Upload</Button>
                </FormGroup>
            </Form>
        </div>
    )
}

export default UploadPostPhotos