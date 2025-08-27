import React from 'react'
import { Col, Card, Button, CardTitle, CardText, Alert } from 'reactstrap'
import { Link } from "react-router-dom"
import BroadcastModal from './BroadcastModal'
import { deleteBroadcast } from '../../redux/slices/broadcastsSlice'
import DeleteModal from '../../utils/DeleteModal'

const BroadcastsCard = ({ broadcastsToUse }) => {

    return (
        broadcastsToUse && broadcastsToUse.length > 0 ?
            <>
                <span className='w-100 d-flex justify-content-end ps-sm-4 mb-sm-4'>
                    <Button color="warning" size="sm">
                        <BroadcastModal />
                    </Button>
                </span>
                {broadcastsToUse && broadcastsToUse.map(broadcast => (
                    <Col sm="6" className="mt-2 contact-card" key={broadcast._id}>

                        <Card body>

                            <CardTitle className="d-flex justify-content-between">
                                <Link to='#' className="text-success">
                                    {broadcast && broadcast.title}
                                </Link>

                                <div className="d-flex">
                                <DeleteModal deleteFnName="deleteBroadcast" deleteFn={deleteBroadcast} delID={broadcast._id} delTitle={broadcast.title} />
                                </div>
                            </CardTitle>

                            <CardText>{broadcast && broadcast.message}</CardText>

                            <hr />
                            <small className="text-info d-flex justify-content-around">
                                <u>Sent on {broadcast && broadcast.createdAt.split('T').slice(0, 2).join(' at ')}</u>
                                <b>{broadcast.sent_by && broadcast.sent_by.name}</b>
                            </small>
                        </Card>
                    </Col>
                ))}
            </> :
            <Alert color="danger" className="w-50 text-center mx-auto" style={{ border: '2px solid #157A6E' }}>
                Seems like you have nothing here!
            </Alert>
    )
}

export default BroadcastsCard