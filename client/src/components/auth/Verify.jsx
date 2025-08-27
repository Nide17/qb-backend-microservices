import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Container, Row, Col, Input, Button } from 'reactstrap'
import { notify } from '@/utils/notifyToast'
import { verify } from '@/redux/slices/authSlice'
import QBLoading from '@/components/rLoading/QBLoading'
import SquareAd from '@/components/adsenses/SquareAd'
import ResponsiveAd from '@/components/adsenses/ResponsiveAd'

export function Verify() {

    const [otp, setOtp] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isLoading } = useSelector(state => state.auth)
    const onChangeHandler = e => setOtp(e.target.value)
    useEffect(() => { document.title = "Verify OTP" }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!localStorage.getItem('emailForOTP')) {
            notify('Invalid email request, start again!')
            return
        }

        if (otp.length !== 6 || isNaN(otp)) {
            notify('Invalid code!')
            return
        }

        try {
            const result = await dispatch(verify({ email: localStorage.getItem('emailForOTP'), otp }))

            if (result.payload.user) {
                setTimeout(() => {
                    navigate('/dashboard')
                }, 2000)
            } else {
                notify('OTP verification failed. Please try again.', 'error')
            }
        } catch (error) {
            console.error(error)
            notify('An error occurred during verification. Please try again.', 'error')
        }

        // Reset fields
        setOtp('')
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
                <div className="text-center">

                    <h2 className="font-weight-bold mb-4 text-success">
                        Verify your account
                    </h2>

                    <p color="blue-gray" className="text-lg font-normal">
                        Enter the 6 digits code sent to your email here ...
                    </p>

                </div>
                <form className="" onSubmit={handleSubmit}>

                    <div className="d-flex justify-content-center align-items-center text-center">
                        <Input bsSize="lg" placeholder="OTP code" className="text-center" style={{ width: '200px' }}
                            type='text' maxLength={6} minLength={6} autoComplete='off' autoFocus={true}
                            name='otp' value={otp} onChange={onChangeHandler} />
                    </div>

                    <Button className="bg-success mt-4" type='submit' disabled={isLoading}>
                        {isLoading ? <QBLoading /> : "Verify"}
                    </Button>
                </form>

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

export default Verify
