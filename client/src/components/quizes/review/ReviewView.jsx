import React from 'react'
import { Col, Row, Button, Badge, Form, Input, FormGroup, FormFeedback } from 'reactstrap';

const ReviewView = ({ qnsAll, curRevQn, lastAnswer, currentQuestion, setLastAnswer, setCurrentQuestion }) => {

    const curRevQnOpts = curRevQn && curRevQn.answerOptions
    const trueAnsNbr = curRevQnOpts && curRevQnOpts.filter(aOpt => aOpt.isCorrect === true).length
    const trueChoicesNbr = curRevQnOpts && curRevQnOpts.filter(aOpt => aOpt.isCorrect === true && aOpt.choosen === true).length

    const handleNextAnswer = () => {
        const nextQuestion = currentQuestion + 1;
        nextQuestion < qnsAll.length ?
            setCurrentQuestion(nextQuestion) :
            setLastAnswer(true)
    };

    const handlePrevAnswer = () => {
        const prevQuestion = currentQuestion - 1;
        prevQuestion >= 0 ?
            setCurrentQuestion(prevQuestion) :
            alert('No previous available!')
    };

    return (
        <Row>
            <Col>
                <div className='answer d-flex flex-column mx-auto mt-2 w-100'>
                    <Form>
                        {curRevQnOpts && curRevQnOpts.map((answerOption, index) => {

                            let explanation = answerOption.explanations ? answerOption.explanations : null

                            {/* If there is a word in the explanation paragraph that starts with http, make it a link */ }
                            if (explanation) {
                                let words = explanation.split(" ")
                                explanation = words.map(word => {
                                    if (word.startsWith("http")) {
                                        return <a key={word} href={word} target="_blank" rel="noreferrer">{word} </a>
                                    }
                                    return word + " "
                                })
                            }

                            return (
                                <FormGroup key={index}>
                                    <Input
                                        disabled
                                        defaultValue={answerOption.answerText}
                                        valid={answerOption.isCorrect}
                                        invalid={!answerOption.isCorrect && answerOption.choosen}
                                        className={`${!answerOption.isCorrect && !answerOption.choosen ?
                                            'border border-secondary' :
                                            null}`}
                                        style={{ backgroundColor: "#F5F5F5", color: "#000" }}
                                    />

                                    <FormFeedback
                                        style={{ fontSize: ".7rem" }}
                                        valid={answerOption.isCorrect}
                                        invalid={(!answerOption.isCorrect && answerOption.choosen).toString()}>
                                        {answerOption.isCorrect && answerOption.choosen ? 'You got this right!' :
                                            !answerOption.isCorrect && answerOption.choosen ? 'Your choice was incorrect!' :
                                                answerOption.isCorrect ? 'Correct answer!' : null}
                                    </FormFeedback>
                                    {explanation && <div className="border rounded p-1 p-lg-2 mt-2">
                                        <small className="text-dark mb-1 pl-1" style={{ fontSize: ".8rem" }}>
                                            <span role="img" aria-label="pointing">👉</span> {explanation}
                                        </small>
                                    </div>}
                                </FormGroup>
                            )
                        })}
                    </Form>
                </div>

                <div className="prevNext d-flex justify-content-between align-items-center mt-5">
                    <Button style={{ color: '#157A6E', backgroundColor: '#ffc107' }} className="ms-0 ms-md-5 p-1 px-md-2" onClick={handlePrevAnswer}>Previous</Button>
                    <Badge href="#" color={trueAnsNbr === trueChoicesNbr ? 'success' : 'danger'}>
                        {`Your answer was ${trueAnsNbr === trueChoicesNbr ? 'correct' : 'incorrect'}`}
                    </Badge>
                    <Button style={{ color: '#157A6E', backgroundColor: '#ffc107' }} className="me-0 me-md-5 p-1 px-md-2" onClick={handleNextAnswer}>
                        {lastAnswer ? 'End' : 'Next'}</Button>
                </div>
            </Col>
        </Row>
    )
}

export default ReviewView