import React, { useState, useEffect } from 'react'
import { Button, Modal, ModalBody, Form, FormGroup, Label, Input, NavLink } from 'reactstrap'
import { login } from '../../redux/slices/authSlice'
import { useSelector, useDispatch } from "react-redux"
import ReactGA from "react-ga4"
import logocirclewhite from '../../../src/images/logocirclewhite.svg'
import avatar from '../../../src/images/avatar1.svg'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { notify } from '../../utils/notifyToast'

const LoginModal = ({ isOpenL, toggleL, toggleR }) => {

    const { isLoading } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const isAuthenticated = useSelector(state => state.auth && state.auth.isAuthenticated)

    //properties of the modal
    const [loginState, setLoginState] = useState({ email: '', password: '' })
    const [loginResponse, setLoginResponse] = useState(null) // Corrected typo
    const [confirmLogin, setConfirmLogin] = useState(false)
    const [errorMessage, setErrorMessage] = useState('') // Add state for error message

    // Lifecycle methods
    useEffect(() => {

        if (loginResponse && loginResponse.type === 'auth/login/rejected' && loginResponse.error && loginResponse.error.message === 'CONFIRM_ERR') {
            setConfirmLogin(true)
        }

        // If Authenticated, close isOpenL
        if (isOpenL) {
            if (isAuthenticated) {
                toggleL()

                // Google Analytics
                ReactGA.event({
                    category: 'auth_category',
                    action: 'login_action',
                    label: 'login_label'
                })
            }
        }
        if (loginResponse && loginResponse.type === 'auth/login/rejected') {
            setErrorMessage(loginResponse.error.message == 'CONFIRM_ERR' ?
                'Already logged in on another device/browser, log them out to use here?' :
                loginResponse.error.message)
        }
    }, [isAuthenticated, isOpenL, toggleL, loginResponse])

    const onChangeHandler = e => {
        setLoginState({ ...loginState, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e, conf) => {
        e.preventDefault()
        setErrorMessage('')

        const { email, password } = loginState
        const user = { email, password, confirmLogin: conf }

        // VALIDATE
        if (password.length < 4) {
            notify('Password should be at least 4 characters!')
            return
        }

        // Attempt to login
        const res = await dispatch(login(user))
        setLoginResponse(res)
    }
    return (
        <>
            <Modal isOpen={isOpenL} toggle={toggleL} centered={true}>
                <div
                    className="d-flex justify-content-between align-items-center p-2"
                    style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    <img src={logocirclewhite} alt="logo"
                        style={{ maxHeight: "3.2rem", color: "#157A6E" }} />
                    <Button className="btn-danger text-uppercase text-red ms-auto me-0"
                        style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggleL}>
                        X
                    </Button>
                </div>

                {isLoading ? <QBLoadingSM /> : null}

                {/* icon + title */}
                <div className='d-flex justify-content-center align-items-center pt-3'>
                    <img src={avatar} alt="avatar" style={{ maxHeight: "1.22rem" }} />
                    <h5 className='text-center text-dark fw-bolder align-baseline mb-0 ms-2'>
                        Login
                    </h5>
                </div>

                <ModalBody className='pb-0'>
                    {errorMessage && <div className="alert alert-danger"
                        style={{ fontSize: ".65rem", fontWeight: 900 }}>
                        {errorMessage}</div>}
                    {
                        confirmLogin ?
                            <Button
                                style={{ marginBottom: '2rem', backgroundColor: "#ffc107", color: "#157A6E", fontWeight: 900 }} block
                                onClick={(e) => onSubmitHandler(e, true)}>
                                Confirm Login
                            </Button> :
                            null
                    }

                    <Form onSubmit={(e) => onSubmitHandler(e, false)}>
                        <FormGroup>
                            <Label for="email" className="mb-2 fw-bolder">
                                Email
                            </Label>
                            <Input type="email" name="email" placeholder="E-mail here ..." className="mb-4" onChange={onChangeHandler} />
                            <Label for="password" className="mb-2 fw-bolder">
                                Password
                            </Label>
                            <Input type="password" name="password" placeholder="Password here ..." className="mb-4" onChange={onChangeHandler} />
                            <a href="forgot-password">
                                <p className="p-2 p-xl-2 fw-bolder" style={{ color: "#157A6E" }}>
                                    Forgot password?
                                </p>
                            </a>
                            {confirmLogin ? null :
                                <Button style={{ marginTop: '2rem', backgroundColor: "#157A6E" }} block>
                                    Login
                                </Button>}
                        </FormGroup>
                    </Form>
                    <div className="d-flex align-items-center justify-content-around">
                        <p className="p-2 p-xl-2 m-0">No account yet?</p>
                        <NavLink onClick={toggleR} className="fw-bolder" style={{ color: "#157A6E" }}>
                            Register
                        </NavLink>
                    </div>
                </ModalBody>
            </Modal>
        </>
    )
}

export default LoginModal