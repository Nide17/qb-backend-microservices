import React, { useState, useEffect } from 'react'
import { Col, Row, Card, Alert, Button } from 'reactstrap'
import { getImageUploadsByOwner } from '../../../redux/slices/imageUploadsSlice'
import { deleteBlogPostImage } from '../../../redux/slices'
import { useSelector, useDispatch } from "react-redux"
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import './yourimages.css'
import DeleteModal from '../../../utils/DeleteModal'

const YourImages = () => {

    const dispatch = useDispatch()
    const yourImages = useSelector(state => state.imageUploads)
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uID = currentUser && currentUser._id

    useEffect(() => {
        dispatch(getImageUploadsByOwner(uID))
    }, [dispatch, uID])

    const [show, setShow] = useState(false)
    const [imgTitle, setImgTitle] = useState('')

    const copying = (img) => {
        var cp = navigator.clipboard.writeText(img && img.uploadImage)
        setShow(true)
        setImgTitle(img && img.imageTitle)

        if (cp) {
            window.setTimeout(() => setShow(false), 3000)
        }
        else return null
    }

    return (
        yourImages.isLoading ?
            <QBLoadingSM /> :
            <>

                <h5 className='text-center d-block'>AVAILABLE IMAGES</h5>
                <small className="d-block text-warning text-center fw-bolder">
                    {show ? `${imgTitle} copied` : ''}
                </small>
                <Row>

                    {
                        yourImages.imageUploadsByOwner && yourImages.imageUploadsByOwner.length === 0 ?

                            <Alert color="danger">You have not uploaded any image!</Alert> :

                            yourImages.imageUploadsByOwner && yourImages.imageUploadsByOwner.map(img => (
                                <Col sm='6' className='yourOneImg' key={img && img._id}>
                                    <Card inverse>
                                        <DeleteModal deleteFnName="deleteBlogPostImage" deleteFn={deleteBlogPostImage} delID={img._id} delTitle={img.imageTitle} />
                                        <img src={img && img.uploadImage} alt='' />
                                        <Button className='btn-info mt-1 py-0' onClick={(event) => copying(img, event)}
                                        >
                                            <small className='d-block'>{img && img.imageTitle}</small>
                                            <small className='d-block'>Click to copy</small>
                                        </Button>
                                    </Card>
                                </Col>))}
                </Row>
            </>
    )
}

export default YourImages