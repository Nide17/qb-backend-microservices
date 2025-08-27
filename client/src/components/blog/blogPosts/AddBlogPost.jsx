import React, { useState, useContext } from 'react'
import { Button, Form, FormGroup, Label, Input, Row, Col, Alert, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import { useParams } from 'react-router-dom'
import { createBlogPost } from '../../../redux/slices'
import { useDispatch, useSelector } from "react-redux"
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import UploadPostPhotos from './UploadPostPhotos'
import YourImages from './YourImages'
import { logRegContext } from '../../../appContexts'

const AddBlogPost = () => {

    // redux
    const dispatch = useDispatch()
    const { toggleL } = useContext(logRegContext)

    const auth = useSelector(state => state.auth)
    const isAuthenticated = auth && auth.isAuthenticated
    const currentUser = auth && auth.user
    const userLoading = auth && auth.isLoading

    const curUserRole = currentUser && currentUser.role
    const isAuthorized = curUserRole === 'Admin' || curUserRole === 'SuperAdmin' || curUserRole === 'Creator'

    const { bPCatID } = useParams()
    const [bPState, setBPState] = useState({
        title: '',
        markdown: '',
        bgColor: ''
    })

    const [post_image, setPost_image] = useState('')


    const onChangeHandler = e => {
        setBPState({ ...bPState, [e.target.name]: e.target.value })
    }

    const onFileHandler = (e) => {
        setPost_image(e.target.files[0])
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const formData = new FormData()
        const { title, markdown, bgColor } = bPState

        // VALIDATE
        if (title.length < 4 || markdown.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (title.length > 70) {
            notify('Title is too long!')
            return
        }

        // Create new BP object
        formData.append('title', title)
        formData.append('postCategory', bPCatID)
        formData.append('markdown', markdown)
        formData.append('post_image', post_image)
        formData.append('bgColor', bgColor)
        formData.append('creator', auth.isLoading === false ? currentUser._id : null)

        // Attempt to create
        dispatch(createBlogPost(formData))

        // Reset form fields
        setBPState({
            title: '',
            markdown: '',
            bgColor: '',
        })
        setPost_image('')
    }

    return (
        !isAuthenticated ?
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {
                    userLoading ?
                        <QBLoadingSM /> :
                        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                            Login first
                        </Button>
                }
            </div> :

            isAuthorized ?
                <>
                    <Row className="p-2 pt-lg-5">

                        <Col sm="8" className="mt-md-2">
                            <Breadcrumb>
                                <BreadcrumbItem active>Create new blog post</BreadcrumbItem>
                            </Breadcrumb>


                            <div className="px-2">
                                <Form onSubmit={onSubmitHandler}>

                                    <FormGroup>

                                        <Label for="title">
                                            <strong className='text-success'>Title</strong>
                                        </Label>

                                        <Input type="text" name="title" placeholder="Blog post title ..." className="mb-3" onChange={onChangeHandler} value={bPState.title || ''} />

                                        <Label for="bgColor">
                                            <strong className='text-success'>Background color</strong>
                                        </Label>

                                        <Input type="text" name="bgColor" placeholder="Type the post background color ..." className="mb-3" onChange={onChangeHandler} value={bPState.bgColor || ''} />

                                        <Label for="markdown">
                                            <strong className='text-success'>Markdown</strong>
                                        </Label>

                                        <Input type="textarea" name="markdown" placeholder="Blog post details ..." minLength="100" rows="15" className="mb-2" onChange={onChangeHandler} value={bPState.markdown || ''} />

                                        <Label for="post_image">
                                            <strong className='text-success'>Representing Image</strong>&nbsp;
                                            <small className="text-info">.jpg, .png, .jpeg, .svg</small>
                                        </Label>
                                        <Col>
                                            <Input bsSize="sm" type="file" accept=".jpg, .png, .jpeg, .svg" name="post_image" onChange={onFileHandler} label="Pick an image ..." id="post_image_pick" required />
                                        </Col>

                                        <Button color="success" style={{ marginTop: '2rem' }} block >Create</Button>
                                    </FormGroup>
                                </Form>
                            </div>
                        </Col>

                        <Col sm="4" className="mt-md-2">
                            <UploadPostPhotos />
                            <YourImages />
                        </Col>
                    </Row>
                </> :
                <Alert color="danger" className='m-5 text-center'>Access Denied!</Alert>
    )
}

export default AddBlogPost