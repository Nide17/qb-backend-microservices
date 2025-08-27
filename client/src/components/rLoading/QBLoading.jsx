import React from 'react'
import { Spinner } from 'reactstrap'

const QBLoading = () => {
    return (
        <div className="vh-100 d-flex justify-content-center align-items-center">
            <Spinner color="success" type="grow" sm='xl' style={{
                width: '10rem',
                height: '10rem'
            }}> </Spinner>
        </div>
    )
}

export default QBLoading
