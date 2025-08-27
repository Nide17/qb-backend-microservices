import React from 'react'
import { Button } from 'reactstrap'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const OnLastAnswer = ({ thisQuiz }) => {

    const isAuthenticated = useSelector(state => state.auth && state.auth.isAuthenticated)

    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1)
    }
    return (
        isAuthenticated ?

            <div className='score-section text-center py-4'>

                <h5 className="text-center fw-bolder">Reviewing finished!</h5>

                <Link to={`/view-quiz/${thisQuiz.slug}`}>
                    <Button color="outline-success" className="mt-3">
                        Retake
                    </Button>
                </Link>

                <Button color="success" className="mt-3 share-btn mx-1 mx-md-3">
                    <i className="fa-brands fa-whatsapp"></i>&nbsp;
                    <a className="text-white" href={`https://api.whatsapp.com/send?phone=whatsappphonenumber&text=Attempt this ${thisQuiz.title} on Quiz-Blog
                        \nhttp://www.quizblog.rw/view-quiz/${thisQuiz.slug}`}>Share</a>
                </Button>

                <Button color="outline-info" className="mt-3" onClick={goBack}>
                    Back
                </Button>

            </div> :

            <div className='score-section text-center'>
                <h5>Only members are allowed!</h5>
            </div>
    )
}

export default OnLastAnswer
