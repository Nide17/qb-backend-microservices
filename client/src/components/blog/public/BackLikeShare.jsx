import React from 'react'
import { Button } from 'reactstrap'

const BackLikeShare = ({ articleName, articleCreator }) => {
    return (
        <div className="back-share px-2 d-flex justify-content-between align-items-center">
            <Button color="info" size="sm" outline className='d-none d-sm-inline'><a href='/blog'>&lt; All Posts</a></Button>

            <div className="like-share d-flex align-items-center">

                <p className='mb-0'>Share this article on</p>
                <ul className='d-flex mb-0'>
                    <li>
                        <ul className="social-network social-circle">
                            <li><a href={`https://api.whatsapp.com/send?phone=whatsappphonenumber&text=${articleName}
                                \n${window.location.href}`} target="_blank" rel="noopener noreferrer" className="icoWhatsapp" title="Whatsapp">
                                <i className="fa-brands fa-whatsapp"></i>
                            </a></li>

                            <li><a href={`https://www.facebook.com/share.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="icoFacebook" title="Facebook">
                                <i className="fa-brands fa-facebook"></i>
                            </a></li>

                            <li><a href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${articleName}&summary=${articleCreator}&source=Quiz-Blog`} target="_blank" rel="noopener noreferrer" className="icoLinkedin" title="Linkedin">
                                <i className="fa-brands fa-linkedin"></i>
                            </a></li>

                            <li><a href={`https://www.instagram.com/?url=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="icoInstagram" title="Instagram">
                                <i className="fa-brands fa-instagram"></i>
                            </a></li>

                            <li><a href={`http://twitter.com/share?text=${articleName}&url=${window.location.href}&hashtags=${articleName},QuizBlog,${articleCreator}`} target="_blank" rel="noopener noreferrer" className="icoTwitter" title="Twitter">
                                <i className="fa-brands fa-x-twitter"></i>
                            </a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default BackLikeShare