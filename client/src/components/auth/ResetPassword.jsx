import React, { useState } from 'react'
import { Container, Row, Col, Button, Form, Input } from 'reactstrap'
import ResponsiveAd from '../adsenses/ResponsiveAd'
import SquareAd from '../adsenses/SquareAd'
import { sendNewPassword } from '../../redux/slices/authSlice'
import { useDispatch } from "react-redux"

const ResetPassword = () => {

    const dispatch = useDispatch()

    const [newPasswords, setNewPasswords] = useState({
        password: '',
        password1: ''
    })

    const onChangeHandler = e => {
        setNewPasswords({ ...newPasswords, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = e => {
        e.preventDefault()

        const { password, password1 } = newPasswords

        if (!password || !password1) {
            notify('Passwords can not be empty!')
            return
        }

        else if (password !== password1) {
            notify('Passwords must match!')
            return
        }

        // Exploit token and userId from URL
        const queryString = window.location.search
        const urlParams = new URLSearchParams(queryString)
        const token = urlParams.get('token')
        const userId = urlParams.get('id')

        // Create new pswd object
        const updatePsw = {
            userId,
            token,
            password
        }

        // Attempt to reset
        dispatch(sendNewPassword(updatePsw))
    }

    return (

        <Container className="forgot-password mt-4">
            <Row className="mt-5 d-block text-center" style={{ minHeight: '68vh' }}>
                <>
                    <h2 className="fw-bolder my-3" style={{ color: '#157A6E' }}>
                        Update your password here
                    </h2>

                    <p>
                        Please enter identical passwords to reset your account.
                    </p>

                    {/* Google square ad */}
                    <Row className='w-100'>
                        <Col sm="12">
                            {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                        </Col>
                    </Row>
                    <Form className="my-4" onSubmit={onSubmitHandler}>
                        <div className="input-group mx-auto my-5 search w-50">
                            <Input type="password"
                                name="password"
                                className="form-control"
                                placeholder=" Create password ..."
                                onChange={onChangeHandler} />
                        </div>

                        <div className="input-group mx-auto my-5 search w-50">
                            <Input type="password"
                                name="password1"
                                className="form-control"
                                placeholder=" Verify password ..."
                                onChange={onChangeHandler} />
                        </div>

                        <Button color="info" size="md" className="mt-4 d-block mx-auto text-white" style={{ width: '16%' }}>
                            Reset
                        </Button>

                    </Form>
                    {/* Google responsive 1 ad */}
                    <Row className='w-100'>
                        <Col sm="12">
                            <div className='w-100'>
                                {process.env.NODE_ENV !== 'development' ? <ResponsiveAd /> : null}
                            </div>
                        </Col>
                    </Row>
                </>
            </Row>
        </Container>
    )
}

export default ResetPassword