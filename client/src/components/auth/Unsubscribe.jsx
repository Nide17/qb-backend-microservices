import React, { useState, useContext } from 'react'
import { Container, Row, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import { deleteSubscriber } from '../../redux/slices/subscribersSlice'
import { useDispatch } from "react-redux"
import { logRegContext } from '../../appContexts'
import QBLoadingSM from '../rLoading/QBLoadingSM'

const Unsubscribe = () => {

    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const isAuthenticated = useSelector(state => state.auth && state.auth.isAuthenticated)
    const { toggleL } = useContext(logRegContext)
    const [unsubscribed, setUnsubscribed] = useState(false)

    const onUnsubscribe = e => {
        e.preventDefault()

        // Attempt unsubscribe
        dispatch(deleteSubscriber(currentUser.email))
        setUnsubscribed(true)
    }

    return (

        isAuthenticated ?

            <Container className="forgot-password mt-4">
                <Row className="mt-5 d-block text-center">

                    {unsubscribed ?
                        <h6 className="fw-bolder my-5 py-5 text-success">
                            You have unsubscribed from Quiz-Blog! you will no longer receive updates.
                        </h6> :

                        <h6 className="fw-bolder my-5 py-5 text-dark">
                            Are sure, you want to unsubscribe? click here to &nbsp;
                            <Link to="#/" onClick={onUnsubscribe}>unsubscribe</Link>
                        </h6>
                    }

                </Row>
            </Container> :

            // If not authenticated
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {
                    auth.isLoading ?
                        <QBLoadingSM /> :
                        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                            Login first
                        </Button>
                }
            </div>
    )
}

export default Unsubscribe