import React from 'react'
import { Row, Col } from "reactstrap"
import SquareAd from '../adsenses/SquareAd'
import ResponsiveAd from '../adsenses/ResponsiveAd'
import Biographies from './Biographies'
import Intro from './Intro'
import './about.css'


const About = () => {
    return (
        <section className="about-section px-lg-5 mx-lg-5">
            <div className="w-100">
                <Intro />
                {/* Google responsive 1 ad */}
                <Row className='w-100'>
                    <Col sm="12">
                        <div className='w-100'>
                            {process.env.NODE_ENV !== 'development' ? <ResponsiveAd /> : null}
                        </div>
                    </Col>
                </Row>
                <Biographies />
                {/* Google square ad */}
                <Row className='w-100'>
                    <Col sm="12">
                        <div className='w-100'>
                            {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                        </div>
                    </Col>
                </Row>
            </div>
        </section>)
}

export default About