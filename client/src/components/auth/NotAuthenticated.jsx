import React, { useContext } from 'react'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { Button } from 'reactstrap'
import { logRegContext } from '../../appContexts'
import './NotAuthenticated.css'

const NotAuthenticated = ({ auth }) => {

    const { toggleL } = useContext(logRegContext)

    return (
        // If not authenticated or loading
        <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
            {
                auth.isLoading ?
                    <QBLoadingSM /> :
                    <Button color="link" className="login-button" onClick={toggleL}>
                        Login first
                    </Button>
            }
        </div>
    )
}

export default NotAuthenticated
