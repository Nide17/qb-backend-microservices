import React from 'react'
import { Col, Row, Card, CardTitle, Button } from 'reactstrap'
import DeleteIcon from '../../images/trash.svg'
import { deleteVideo } from '../../redux/slices/quizesSlice'
import { deleteFaqVideo } from '../../redux/slices/faqsSlice'
import { useDispatch } from 'react-redux'
import { useSelector } from "react-redux"

const EmbeddedVideos = ({ quiz, faq, isFromFaqs }) => {

    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user

    const videos = isFromFaqs ? faq && faq.video_links : quiz && quiz.oneQuiz && quiz.oneQuiz.video_links
    const iD = isFromFaqs ? faq && faq._id : quiz && quiz.oneQuiz && quiz.oneQuiz._id

    const delHandler = (vId) => {
        // Create new object
        const vidData = { vId, iD }

        // Attempt to create
        isFromFaqs ?
            dispatch(deleteFaqVideo(vidData, vId)) : dispatch(deleteVideo(vidData, vId))
    }

    return (
        videos.length > 0 &&
        <Row>
            <Col sm={12} style={{ backgroundColor: "khaki" }}>
                <h4 className="my-2 my-lg-4 text-center fw-bolder d-block">
                    VIDEOS
                </h4>
            </Col>

            {videos && videos.map((vid, index) => (
                <Col sm={6} key={index} className="my-5">

                    <Card body className='question-section text-center my-2 mx-auto w-75 p-0 py-3 p-sm-2'>
                        <CardTitle tag="small" className='question-count text-uppercase text-center text-success fw-bolder'>
                            {vid && vid.vtitle}
                            <Button size="sm" color="white" className={`me-2 ${(currentUser && currentUser.role) === 'Admin' || (currentUser && currentUser.role) === 'SuperAdmin' ? '' : 'd-none'}`} onClick={() => delHandler(vid._id)}>
                                &nbsp;&nbsp;&nbsp;<img src={DeleteIcon} alt="" width="10" height="10" />
                            </Button>
                        </CardTitle>

                        <div>
                            <iframe className="mx-auto border rounded" width="320" height="190" src={vid && vid.vlink} title="YouTube video player" frameBorder="0" allow="accelerometer autoplay clipboard-write encrypted-media gyroscope picture-in-picture" allowFullScreen></iframe>
                        </div>

                    </Card>
                </Col>
            ))}
        </Row>
    )
}

export default EmbeddedVideos