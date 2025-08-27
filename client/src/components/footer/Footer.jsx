import React from 'react'
import { useLocation } from "react-router-dom"
import './footer.css'
import logo from '../../images/quizLogo.svg'

const Footer = () => {

    let location = useLocation()

    // If the route starts with /questions, /dashboard or /statistics, then don't show the footer
    if (location.pathname.startsWith('/questions') || 
        location.pathname.startsWith('/dashboard') || 
        location.pathname.startsWith('/statistics') ||
        location.pathname.startsWith('/contact-chat')) {
        return null

    } else return (
            <footer className="mainfooter mt-1 px-3" role="contentinfo">
                <div className="footer-middle">
                    <div className="container">

                        <div className="row">
                            <div className="col-md-3 mb-2">
                                <h4 className="mb-3 mb-md-2">Contact</h4>
                                <div className="logo mb-3 mb-md-3">
                                    <a href="/"><img src={logo} alt="logo" /></a>
                                </div>

                                <ul className="social-network social-circle">
                                    <li><a href="https://api.whatsapp.com/send?phone=250780579067" className="icoWhatsapp" title="Whatsapp" target="_blank" rel="noopener noreferrer">
                                        <i className="fa-brands fa-whatsapp"></i>
                                    </a></li>
                                    <li><a href="https://www.facebook.com/QuizblogRw/" className="icoFacebook" title="Facebook" target="_blank" rel="noopener noreferrer">
                                        <i className="fa-brands fa-facebook"></i>
                                    </a></li>
                                    <li><a href="https://www.linkedin.com/company/quiz-blog/" className="icoLinkedin" title="Linkedin" target="_blank" rel="noopener noreferrer">
                                        <i className="fa-brands fa-linkedin"></i>
                                    </a></li>
                                    <li><a href="https://www.instagram.com/quizblogrw/" className="icoInstagram" title="Instagram" target="_blank" rel="noopener noreferrer">
                                        <i className="fa-brands fa-instagram"></i>
                                    </a></li>
                                    <li><a href="https://twitter.com/QuizblogRw" className="icoTwitter" title="Twitter" target="_blank" rel="noopener noreferrer">
                                        <i className="fa-brands fa-x-twitter"></i>
                                    </a></li>
                                </ul>
                            </div>

                            <div className="col-md-3 col-sm-6">
                                <div className="footer-pad">
                                    <h4 className='mt-4 mt-lg-0'>About</h4>
                                    <ul className="list-unstyled ms-2">
                                        <li><a href="/about">Our Team</a></li>
                                        <li><a href="/contact">Reach Us</a></li>
                                        <li><a href="/faqs">FAQS</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="col-md-3 col-sm-6">
                                <div className="footer-pad">
                                    <h4 className='mt-4 mt-lg-0'>Terms of Use</h4>
                                    <ul className="list-unstyled ms-2">
                                        <li><a href="/disclaimer">Disclaimer</a></li>
                                        <li><a href="/privacy">Privacy Policy</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="col-md-3 col-sm-6">
                                <div className="footer-pad">
                                    <h4 className='mt-4 mt-lg-0'>Services</h4>
                                    <ul className="list-unstyled ms-2">
                                        <li><a href="/allposts">All Quizzes</a></li>
                                        <li><a href="/course-notes">Notes</a></li>
                                        <li><a href="/blog">Blog Posts</a></li>
                                    </ul>
                                </div>
                            </div>

                        </div>

                        <div className="row">
                            <div className="col-md-12 copy">
                                <p className="text-center">&copy; Copyright {new Date().getFullYear()} ~ Quiz-Blog.  All Rights Reserved.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </footer>
        )
}

export default Footer