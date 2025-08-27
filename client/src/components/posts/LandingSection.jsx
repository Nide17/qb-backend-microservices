import React, { useContext } from 'react'
import { Row, Col, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import srcQuestion from '../../images/undraw_Question2.svg'
import Adverts from './Adverts'
import { logRegContext } from '../../appContexts'

const LandingSection = () => {

    const { toggleR } = useContext(logRegContext)
    let title = 'KNOWLEDGE MATTERS, AND SO DOES THE JOY OF QUIZZING!'

    const capitalize = (str) => {
        let lower = str.toLowerCase()
        return lower.charAt(0).toUpperCase() + lower.slice(1)
    }

    return (
        <Row className="intro-landing w-100 d-flex justify-content-around align-items-center mx-auto">
            <Col sm={7} className='d-flex flex-column text-center pt-5 px-3 p-lg-5'>
                <h1 className="text-start text-primary fw-bolder underline pl-lg-4 mb-3 mb-lg-0">
                    {
                        title.split(" ").map(word => {
                            return <span key={word} className="d-inline-block">
                                {capitalize(word)}&nbsp;
                            </span>
                        })
                    }
                </h1>

                <p className="text-start pl-lg-4 py-lg-3">
                    Explore and Test Yourself, Join the Fun of Quizzes and Get Ready to Succeed in your Exams with us, We're in this to Make it Happen! <span role="img" aria-label="home">📚🧠🔍🌟🎉</span>
                </p>

                <img src={srcQuestion} alt="question" style={{ maxHeight: "30vh", maxWidth: "100%" }} className="my-4 d-md-block mx-auto" />

                <div className="d-flex align-items-center pl-lg-4 mt-2 mt-lg-4 justify-content-around">
                    <Button style={{ backgroundColor: "#157A6E", borderRadius: '50px', border: "3px solid #ffc107" }} onClick={toggleR}>
                        Get Started
                    </Button>

                    <Link to="/course-notes" className="text-decoration-none">
                        <Button style={{ backgroundColor: "#ffc107", marginLeft: '3rem', borderRadius: '50px', border: "3px solid #157A6E" }}>
                            Read Notes
                        </Button>
                    </Link>
                </div>
            </Col>

            <Col sm={5} className="d-flex flex-column text-center py-5 p-lg-5">
                <Adverts />
            </Col>
        </Row>
    )
}

export default LandingSection