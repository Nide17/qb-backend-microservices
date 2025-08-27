import React from 'react'
import { Card, CardTitle, CardText, Row, Col, Button, CardImg } from 'reactstrap'
import { Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { changeStatus, deleteAdvert } from '../../../redux/slices/advertsSlice'
import adImage from '../../../images/quizLogo.svg'
import DeleteModal from '../../../utils/DeleteModal'

const AdvertCard = ({ advert, uRole }) => {
    const dispatch = useDispatch()

    return (
        <Card body style={{ height: "100%" }}>
            <CardTitle className='mb-4 d-flex justify-content-between'>
                <Link to={`/advert/${advert._id}`} className="text-success text-uppercase">
                    {advert.caption}
                </Link>
                <DeleteModal deleteFnName="deleteAdvert" deleteFn={deleteAdvert} delID={advert._id} delTitle={advert.caption} />
            </CardTitle>

            <Row style={{ fontSize: ".7rem" }}>
                <Col sm="4">
                    <CardText className='my-4'>{advert.owner}</CardText>
                    <CardText className='my-4'>{advert.email}</CardText>
                    <CardText className='my-4'>{advert.phone}</CardText>
                    <CardText className='my-4 text-info'><u>{advert.link ? advert.link : "No link"}</u></CardText>

                    {uRole === "SuperAdmin" || uRole === "Admin" ?
                        <span>
                            <Button color={`${advert.status === "Active" ? 'danger' : 'success'}`} className='mx-1 text-white text-uppercase'
                                onClick={() => dispatch(changeStatus({
                                    advertID: advert && advert._id,
                                    status: advert.status === "Active" ? "Inactive" : "Active"
                                }))}>
                                {advert.status === "Active" ? "Deactivate" : "Activate"}
                            </Button>
                        </span>
                        : null}
                </Col>
                <Col sm="8">
                    <CardImg top style={{ maxWidth: "100%", height: "auto" }}
                        src={advert.advert_image ? advert.advert_image : adImage} alt="Card image cap" />
                </Col>
            </Row>
        </Card>
    )
}

export default AdvertCard
