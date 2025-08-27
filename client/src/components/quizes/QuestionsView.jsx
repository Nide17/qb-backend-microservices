import React, { useState, useEffect, useCallback } from 'react'
import { Col, Row, Input, Label, FormGroup } from 'reactstrap'
import CountDown from './questionsScore/CountDown'
import QBLoadingSM from '../rLoading/QBLoadingSM'

const QuestionsView = ({ qnsLength, curQnIndex, currentQn, curQnOpts, checkedState, selected, handleOnChange, goToNextQuestion }) => {

    // Load the image
    const [imgLoaded, setImgLoaded] = useState(false)
    const onLoad = useCallback(() => { setImgLoaded(true) }, [])
    useEffect(() => { onLoad() }, [onLoad])

    return (

        imgLoaded ?
            <div className="question-view p-2" style={{ backgroundColor: "#F5F5F5" }}>

                {/* Countdown */}
                <CountDown
                    goToNextQuestion={goToNextQuestion}
                    curQnIndex={curQnIndex}
                    qnsLength={qnsLength}
                    timeInSecs={currentQn && currentQn.duration + 75} />

                {/* Question */}
                <Row>
                    <Col>
                        <div className='question-section my-2 mx-auto w-75'>
                            <h4 className='question-count text-uppercase text-center text-secondary fw-bolder'>
                                <span>Question <b style={{ color: "#B4654A" }}>
                                    {curQnIndex + 1}</b>
                                </span>/{qnsLength}
                            </h4>

                            <h5 className='q-txt mt-4 fw-bolder text-center'>{currentQn && currentQn.questionText}</h5>
                        </div>
                    </Col>
                </Row>

                {/* Image */}
                {currentQn && currentQn.question_image ?
                    <Row>
                        <Col>
                            <div className="my-3 mx-sm-5 px-sm-5 d-flex justify-content-center align-items-center">
                                <img className="w-100 mt-2 mt-lg-0 mx-sm-5 px-sm-5 w-100" src={currentQn && currentQn.question_image} onLoad={onLoad} alt="Question Illustration" />
                            </div>
                        </Col>
                    </Row> : null}

                {/* Answers */}
                <Row>
                    <Col>
                        <div className='answer d-flex flex-column mx-auto mt-2 w-lg-50'>
                            {curQnOpts && curQnOpts.map((answerOption, index) => {
                                return (
                                    <div key={index} className="my-3 my-lg-4">
                                        <FormGroup check>
                                            <Label check
                                                style={{ width: "96%", margin: "auto", border: "2px solid #000", borderRadius: "10px" }}
                                                className={`p-1 text-center ${selected[index] ? 'bg-secondary text-white' : null}`}>

                                                <Input
                                                    className="d-none"
                                                    type="checkbox"
                                                    name={answerOption.answerText}
                                                    value={answerOption.answerText}
                                                    checked={checkedState[index]}
                                                    onChange={(e) => handleOnChange(e, index)}
                                                />{" "}
                                                <span>
                                                    {answerOption.answerText}
                                                </span>
                                            </Label>
                                        </FormGroup>
                                    </div>
                                )
                            })}
                        </div>
                    </Col>
                </Row>
            </div> : <QBLoadingSM title='question' />
    )
}

export default QuestionsView