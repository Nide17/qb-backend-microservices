import React, { useState } from 'react'
import { Container, Row, Col, Button, Form, Input } from 'reactstrap'
import ResponsiveAd from '../adsenses/ResponsiveAd'
import SquareAd from '../adsenses/SquareAd'
import { sendResetLink } from '../../redux/slices/authSlice'
import { useDispatch } from "react-redux"

const ForgotPassword = () => {

    const dispatch = useDispatch()

    const [fEmail, setFEmail] = useState('')

    const onChangeHandler = e => {
        setFEmail({ [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        // VALIDATE
        const emailTest = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i

        if (!fEmail.email) {
            notify('Please provide your email!')
            return
        }
        else if (!emailTest.test(fEmail.email)) {
            notify('Please provide a valid email!')
            return
        }

        // Attempt to send link
        dispatch(sendResetLink(fEmail))
    }

    return (
        <Container className="forgot-password mt-4">
            <Row className="mt-5 d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '68vh' }}>

                {/* Google square ad */}
                <Row className='w-100'>
                    <Col sm="12">
                        {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                    </Col>
                </Row>
                <>
                    <h2 className="fw-bolder my-3" style={{ color: '#157A6E' }}>
                        Restore access to your account here
                    </h2>

                    <p>Provide your email to recover your account</p>
                    <Form className="my-4" onSubmit={onSubmitHandler} style={{ width: '100%' }}>
                        <div className="input-group mx-auto search w-50">
                            <Input type="text"
                                name="email"
                                className="form-control"
                                placeholder=" Email ..."
                                style={{ width: '100%' }}
                                onChange={onChangeHandler} />
                        </div>

                        <Button color="info" size="md" className="mt-4 w-25 d-block mx-auto text-white">
                            Search
                        </Button>

                    </Form>
                </>

                {/* Google responsive 1 ad */}
                <Row className='w-100'>
                    <Col sm="12">
                        <div className='w-100'>
                            {process.env.NODE_ENV !== 'development' ? <ResponsiveAd /> : null}
                        </div>
                    </Col>
                </Row>

            </Row>
        </Container>
    )
}

export default ForgotPassword