import React, { useState, useEffect, lazy } from 'react'
import { Button, Col, Row, Form, FormGroup, Input } from 'reactstrap'
import SquareAd from '../adsenses/SquareAd'
import { sendMsg } from '../../redux/slices/contactsSlice'
import { useDispatch } from "react-redux"
import './contact.css'
import mail from '../../../src/images/mail.svg'
import { useSelector } from "react-redux"
const ResponsiveHorizontal = lazy(() => import('../adsenses/ResponsiveHorizontal'))

const Contact = () => {

    // Redux
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user

    const [state, setState] = useState({
        contact_name: '',
        email: '',
        message: ''
    })

    // Lifecycle methods
    useEffect(() => {
        if (currentUser) {
            setState(state => ({ ...state, contact_name: currentUser.name, email: currentUser.email }))
        }
    }, [currentUser])

    const onChangeHandler = e => {
        const { name, value } = e.target
        setState(state => ({ ...state, [name]: value }))
    }

    const onContact = e => {
        e.preventDefault()

        const { contact_name, email, message } = state

        // VALIDATE
        if (contact_name.length < 3 || email.length < 4 || message.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (contact_name.length > 100) {
            notify('Name is too long!')
            return
        }
        else if (message.length > 1000) {
            notify('Message is too long!')
            return
        }

        // Create user object
        const contactMsg = {
            contact_name,
            email,
            message
        }

        // Attempt to contact
        dispatch(sendMsg(contactMsg))
        window.setTimeout(() => window.location.href = "/contact-chat", 4000)

        // Reset fields
        setState({
            contact_name: '',
            email: '',
            message: ''
        })
    }

    return (
        <div className='contact-section py-0 px-3 py-5'>
            <div className="jbtron rounded px-3 px-sm-4 py-3 py-sm-5 p-2 m-2 m-sm-0 text-center border border-info">

                <h1 className="display-4 fw-bolder text-center my-4 mb-lg-4" style={{ color: "#ffc107" }}>
                    Reach Out Quiz-Blog
                </h1>

                <p className="lead mb-1 mb-lg-4 text-white">
                    Quiz-Blog was created with the intention of offering a diverse range of quizzes and study materials aimed at enhancing students' critical thinking abilities and exam preparedness. Our blog articles span various subjects, serving to deepen students' understanding of their lessons.
                </p>
            </div>

            <Row className="mx-sm-2 px-sm-1 mx-md-5 px-md-5 py-lg-5 mt-5 contact d-md-flex justify-content-center">

                <div className='w-100'>
                    {/* Google responsive 1 ad */}
                    {process.env.NODE_ENV !== 'development' ? <ResponsiveHorizontal /> : null}
                </div>

                <Col sm="6" className="mb-5 px-lg-5">
                    <small className='fw-bolder' style={{ fontSize: '1.1rem', color: '#157A6E' }}>
                        Require more clarification? Feel free to get in touch with us! <span role="img" aria-label="pointing">👉</span>
                    </small>

                    <hr className="my-2" />

                    <Col sm='6' className='contact-img'>
                        <img src={mail} alt="" />
                    </Col>
                </Col>

                <Col sm="6" className="mb-5">
                    <Form onSubmit={onContact}>
                        <FormGroup>
                            <Input type="text" name="contact_name" placeholder="Name" minLength="4" maxLength="30" onChange={onChangeHandler} value={state.contact_name} disabled={currentUser} />
                        </FormGroup>
                        <FormGroup>
                            <Input type="email" name="email" placeholder="Email" onChange={onChangeHandler} value={state.email} disabled={currentUser} />
                        </FormGroup>

                        <FormGroup>
                            <Input type="textarea" name="message" placeholder="Message" rows="5" minLength="10" maxLength="1000" onChange={onChangeHandler} value={state.message} />
                        </FormGroup>
                        <Button style={{ backgroundColor: '#157A6E', color: '#ffc107' }} className='btn-block'>
                            Send Message
                        </Button>
                    </Form>

                    {/* Google square ad */}
                    <Row className='w-100'>
                        <Col sm="12">
                            {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}

export default Contact