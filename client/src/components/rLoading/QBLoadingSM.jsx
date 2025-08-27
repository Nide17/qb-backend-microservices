import React from 'react'
import { Spinner } from 'reactstrap'

const QBLoadingSM = () => {
    return (
        <div className="d-flex justify-content-center align-items-center">
            <Spinner color="success" type="grow" sm='xl'> </Spinner>
        </div>
    )
}

export default QBLoadingSM
