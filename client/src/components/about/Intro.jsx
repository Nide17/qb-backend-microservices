import React from 'react'
import { Row, Col } from 'reactstrap'
import reading from '../../../src/images/reading.svg';

const Intro = () => {
    return (
        <div className='introduct pt-lg-5 mt-5'>
            <h1 className="display-4 fw-bolder text-center py-4 my-lg-2" style={{ color: "#157A6E" }}>
                <span>Get To Know</span> Quiz-Blog
            </h1>

            <Row className='pt-lg-4 px-1 px-lg-5'>
                <Col sm='6' className='intro-img'>
                    <img src={reading} alt="" />
                </Col>

                <Col sm='6' className='intro-text d-flex flex-column align-self-center justify-items-center'>
                    <h1 className="fw-bolder text-center mb-5">
                        <u style={{ color: "#157A6E" }}>
                            Empowering learners
                        </u>
                    </h1>

                    <p className="lead mb-4 ps-lg-5 fw-200">
                        Quiz-Blog was developed with the aim of offering a wide range of quizzes and study materials to support students in improving their cognitive skills and readiness for exams. Our blog articles encompass a variety of subjects, providing valuable insights to enhance students' understanding of their coursework.
                    </p>
                    <hr />
                </Col>
            </Row>

            <Row className='px-3 px-lg-5'>
                <div className="jbtron rounded px-3 px-sm-4 py-3 py-sm-5 p-2 my-3 my-lg-5">

                    <h2 className="fw-bolder text-center my-4 mb-5">
                        <b style={{ color: "#ffc107", backgroundColor: "#FFF", padding: "0.8rem 4rem", clipPath: "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)" }}>
                            Our Journey
                        </b>
                    </h2>
                    <p>
                        Bruce started university in late 2019 and found the shift to self-directed learning challenging. He struggled to find enough practice materials for his studies. To address this, he teamed up with his brother, a software developer, to create Quiz-Blog, a website with Multiple Choice Questions (MCQs) to help students like himself. Originally focused on health sciences, Quiz-Blog now offers resources for various subjects and aims to assist students in Rwanda and worldwide in improving their academic performance.
                    </p>

                    <hr className="my-2" style={{ height: "2px", borderWidth: 0, color: "#157A6E", backgroundColor: "#157A6E" }} />

                </div>
            </Row>
        </div>
    )
}

export default Intro