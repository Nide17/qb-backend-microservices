import React, { useEffect, useState, lazy, Suspense } from 'react'
import { Col, Row, Form, FormGroup, Input, Button } from 'reactstrap'
import subscribe from '../../images/undraw_subscribe.svg'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import ResponsiveAd from '../adsenses/ResponsiveAd'
import { useSelector, useDispatch } from "react-redux"
import { subscribeToPosts } from '../../redux/slices/subscribersSlice'
const ViewCategories = lazy(() => import('../categories/ViewCategories'))
const SquareAd = lazy(() => import('../adsenses/SquareAd'))

const RightSide = ({ categories }) => {

    // Redux
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const [subscriberState, setSubscriberState] = useState({ name: '', email: '' })

    // Lifecycle methods
    useEffect(() => {
        if (currentUser) {
            setSubscriberState(subscriberState => ({ ...subscriberState, name: currentUser.name, email: currentUser.email }))
        }
    }, [currentUser])

    const onChangeHandler = e => {
        const { name, value } = e.target
        setSubscriberState(subscriberState => ({ ...subscriberState, [name]: value }))
    }

    const onSubscribe = e => {
        e.preventDefault()
        const { name, email } = subscriberState
        const subscribedUser = { name, email }
        dispatch(subscribeToPosts(subscribedUser))
        setSubscriberState({ name: '', email: '' })
    }

    return (
        <Col sm="4" className='d-flex flex-column justify-content-around'>

            <Row className='w-100 d-flex justify-content-center align-items-center'>
                <Col sm="12" className='d-flex justify-content-center align-items-center'>
                    <div className='w-100 d-flex justify-content-center align-items-center'>
                        {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                    </div>
                </Col>
            </Row>

            <Row className="mb-4 my-1 d-none d-lg-flex side-category">
                <Suspense
                    fallback={<QBLoadingSM />}>
                    <ViewCategories categories={categories} />
                </Suspense>
            </Row>

            <Row className='w-100 d-flex justify-content-center align-items-center'>
                <Col sm="12" className='d-flex justify-content-center align-items-center'>
                    <div className='w-100 d-flex justify-content-center align-items-center'>
                        {process.env.NODE_ENV !== 'development' ? <ResponsiveAd /> : null}
                    </div>
                </Col>
            </Row>

            <Row className="mb-5 mt-5 mt-lg-0">
                <Form onSubmit={onSubscribe} className="subscribe-form shadow p-3 mb-5 bg-white rounded">
                    <FormGroup className="w-100 px-lg-4 d-flex flex-column justify-content-center align-items-center">
                        <img src={subscribe} alt={subscribe} className="img-fluid w-50 p-2 mt-4 border border-primary rounded shadow-lg p-3 mb-5 bg-white rounded" />

                        <h6 className="mt-2">
                            <b>Subscribe for updates</b>
                        </h6>

                        <Input type="text" name="name" value={subscriberState.name} bsSize="sm" placeholder="Your name" className="mt-4" onChange={onChangeHandler} minLength="4" maxLength="30" required />

                        <Input type="email" name="email" value={subscriberState.email} bsSize="sm" placeholder="Your Email" className="mt-4" onChange={onChangeHandler} required />

                        <Button size="sm" className="me-auto mt-4 bg-primary" style={{ borderRadius: '50px', fontSize: "1.6vw", padding: "2rem!important" }}>
                            Subscribe
                        </Button>
                    </FormGroup>
                </Form>
            </Row>

            <Row className='w-100 d-flex justify-content-center align-items-center'>
                <Col sm="12" className='d-flex justify-content-center align-items-center'>
                    <div className='w-100 d-flex justify-content-center align-items-center'>
                        {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                    </div>
                </Col>
            </Row>
        </Col>
    )
}

export default RightSide