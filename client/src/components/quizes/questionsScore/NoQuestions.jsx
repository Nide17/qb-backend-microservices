import React from 'react'
import { Container, Row, Button } from 'reactstrap'

const NoQuestions = () => {

    return (
        <Container className="main mx-auto d-flex flex-column justify-content-center rounded border border-primary my-5 py-4 w-80">
            <Row className="main mx-auto d-flex flex-column justify-content-center rounded border border-primary my-5 py-4 w-80 text-center">
                <h1 className="text-danger fw-bolder">404</h1>
                <h4>No questions to show!</h4>
                <Button color="info" style={{ width: "120px" }} className="mx-auto mt-4">
                    <a href="/dashboard" className="text-white">Back</a></Button>
            </Row>
        </Container>
    )
}

export default NoQuestions