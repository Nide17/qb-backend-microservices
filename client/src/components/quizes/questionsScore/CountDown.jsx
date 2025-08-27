import React, { useState, useEffect } from 'react'
import { Col, Row } from 'reactstrap';

const CountDown = ({ timeInSecs, qnsLength, curQnIndex, goToNextQuestion }) => {

    let initialMinutes = Math.floor(timeInSecs / 60);
    let initialSeconds = Math.ceil(timeInSecs % 60);

    const [minutes, setMinutes] = useState(initialMinutes);
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {

        let myInterval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(myInterval)
                } else {
                    setSeconds(59);
                    setMinutes(minutes - 1);
                }
            }
        }, 1000)

        if (minutes === 0 && seconds === 0) {
            goToNextQuestion(curQnIndex, qnsLength)
        }

        return () => {
            clearInterval(myInterval);
        };
    });

    return (
        <Row>
            <Col>
                <div className="text-end text-danger me-3">
                    <h6>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</h6>
                </div>
            </Col>
        </Row>
    )
}

export default CountDown