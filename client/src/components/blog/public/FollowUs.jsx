import React from 'react'

const FollowUs = ({ articleName, articleCreator }) => {
    return (
        <div className="back-share px-2 d-flex justify-content-between align-items-center mt-3 bg-success">
            <div className="like-share d-flex flex-column flex-sm-row justify-content-around align-items-center w-100">

                <p className='mb-0 mx-lg-3 text-white'>Follow us on our social media</p>
                <ul className='d-flex mb-0'>
                    <li>
                        <ul className="social-network social-circle">
                            <li className='follow-us'>
                                <a href={`https://www.instagram.com/quizblogrw/`} target="_blank" rel="noopener noreferrer" className="icoInstagram" title="Instagram">
                                    <i className="fa-brands fa-instagram"></i>
                                </a>
                            </li>

                            <li className='follow-us'>
                                <a href={`http://twitter.com/share?text=${articleName}&url=${window.location.href}&hashtags=${articleName},QuizBlog,${articleCreator}`} target="_blank" rel="noopener noreferrer" className="icoTwitter" title="Twitter">
                                    <i className="fa-brands fa-x-twitter"></i>
                                </a>
                            </li>

                            <li className='follow-us'>
                                <a href={`https://www.facebook.com/QuizblogRw/`} target="_blank" rel="noopener noreferrer" className="icoFacebook" title="Facebook">
                                    <i className="fa-brands fa-facebook"></i>
                                </a>
                            </li>

                            <li className='follow-us'>
                                <a href={`https://www.linkedin.com/company/quiz-blog/`} target="_blank" rel="noopener noreferrer" className="icoLinkedin" title="Linkedin">
                                    <i className="fa-brands fa-linkedin"></i>
                                </a></li>

                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default FollowUs