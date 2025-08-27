import React, { useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, Form, FormGroup, Input, ButtonGroup, Alert } from 'reactstrap'

const ReviewForm = ({ isOpen, toggle, onSubmit, quiz, score }) => {

    const [rating, setRating] = useState(-1)
    const [comment, setComment] = useState('')
    const [error, setError] = useState('')

    const handleRatingChange = (value) => {
        setRating(value)
    }

    const handleCommentChange = (event) => {
        setComment(event.target.value)
    }

    const handleSubmit = () => {

        if (rating === -1) {
            setError('Please select a rating')
            return
        }

        onSubmit({ rating, comment, quiz, score })
        toggle()

        // Reset the form
        setRating(-1)
        setComment('')
    }

    const renderRatingButtons = () => {
        const buttons = []
        for (let i = 0; i <= 10; i++) {
            buttons.push(
                <Button
                    key={i}
                    color={rating === i ? getColorByRating(i) : 'white'}
                    onClick={() => handleRatingChange(i)}
                    className="border border-secondary rounded-circle m-1"
                    size="sm"
                >
                    {i}
                </Button>
            )
        }
        return buttons
    }

    const getColorByRating = (value) => {
        if (value === 0) {
            return 'danger'
        } else if (value >= 5) {
            return 'success'
        } else {
            return 'warning'
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} backdrop={false} centered={true}>
            <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                Please give us your feedback
                <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggle}>
                    X
                </Button>
            </div>

            {
                error &&
                <Alert color="danger" className='text-center my-3 mx-5'>
                    {error}
                </Alert>
            }

            <ModalBody>
                <Form>
                    <h6 className="text-center">
                        How would you rate this quiz?
                    </h6>
                    <FormGroup className="d-flex justify-content-center">
                        <ButtonGroup size="lg" className="d-flex justify-content-between">
                            {renderRatingButtons()}
                        </ButtonGroup>
                    </FormGroup>
                    <FormGroup>
                        <Input
                            bsSize="sm"
                            type="textarea"
                            id="comment"
                            value={comment}
                            onChange={handleCommentChange}
                            placeholder="How can we improve it?"
                            style={{ borderColor: rating === 0 ? 'red' : rating >= 5 ? 'green' : '#D4AC0D' }}
                        />
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={handleSubmit} outline size='sm'>
                    Submit
                </Button>{' '}
                <Button color="danger" onClick={toggle} outline size='sm'>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ReviewForm