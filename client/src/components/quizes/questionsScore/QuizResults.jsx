import React, { lazy, Suspense, useContext, useState, useEffect } from 'react'
import { Button } from 'reactstrap'
import { Link, useLocation } from 'react-router-dom'
import MarksStatus from './MarksStatus'
import PdfDocument from '../../dashboard/pdfs/PdfDocument'
import { PDFDownloadLink } from '@react-pdf/renderer'
import SimilarQuizes from './SimilarQuizes'
import RelatedNotes from './RelatedNotes'
import ReviewForm from './ReviewForm';
import { saveFeedback } from '../../../redux/slices/feedbacksSlice'
import { useDispatch } from 'react-redux'
import { logRegContext } from '../../../appContexts'
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import ResponsiveAd from '../../adsenses/ResponsiveAd'

const ResponsiveHorizontal = lazy(() => import('../../adsenses/ResponsiveHorizontal'))
const GridMultiplex = lazy(() => import('../../adsenses/GridMultiplex'))

const QuizResults = () => {

    // Redux
    const dispatch = useDispatch()

    const location = useLocation()
    const { newScoreId, score, qnsLength, thisQuiz, quizToReview, passMark, mongoScoreId } = location.state && location.state
    const marks = isNaN(score) ? 0 : score
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const categories = useSelector(state => state.categories)
    const { toggleL } = useContext(logRegContext)

    const uRole = currentUser && currentUser.role
    const uId = currentUser && currentUser._id

    const scoreToSave = {
        id: newScoreId,
        marks,
        out_of: qnsLength,
        category: thisQuiz && thisQuiz.category && thisQuiz.category._id,
        quiz: thisQuiz && thisQuiz._id,
        review: quizToReview && quizToReview,
        taken_by: uId
    }

    // open review form modal after 3 seconds of quiz results page load
    const [modalOpen, setModalOpen] = useState(false);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    const submitReview = (reviewData) => {
        dispatch(saveFeedback(reviewData))
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setModalOpen(true); // Set Modal to open after 3 seconds
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <div className='p-sm-5 score-section text-center' id='pdf-container'>
                <Suspense fallback={<QBLoadingSM />}>
                    <div className='w-100'>
                        {process.env.NODE_ENV !== 'development' ? <ResponsiveHorizontal /> : null}
                    </div>
                </Suspense>

                <div className={'p-2 p-sm-5 m-2 my-5 mx-sm-auto mx-sm-5 shadow p-3 bg-body rounded'} style={{ border: '3px solid #157A6E' }}>
                    <h5 className='fw-bolder'>You answered <b style={{ color: '#B4654A' }}>{marks}</b> out of <b style={{ color: '#B4654A' }}>{qnsLength}</b> questions correctly.
                        <small className='text-primary fw-bolder'>
                            &nbsp;(~{Math.round(marks * 100 / qnsLength)}%)
                        </small>
                    </h5>

                    {/* Get ready */}
                    <div className='my-sm-5 d-flex justify-content-around align-items-center'>
                        <a href={`/view-quiz/${thisQuiz.slug}`}>
                            <button type='button' className='text-primary mt-3 mt-sm-0 me-2 me-md-0' style={{ backgroundColor: '#ffc107', border: '2px solid #157A6E', borderRadius: '10px', padding: '5px 12px' }}>
                                Retake
                            </button>
                        </a>

                        {uRole ?
                            <>
                                <Button color='success' className='mt-3 mt-sm-0 share-btn mx-1 mx-md-0'>
                                    <i className='fa-brands fa-whatsapp'></i>&nbsp;
                                    <a className='text-white' href={`https://api.whatsapp.com/send?phone=whatsappphonenumber&text=Attempt this ${thisQuiz && thisQuiz.title} quiz on Quiz-Blog
                        \nhttps://www.quizblog.rw/view-quiz/${thisQuiz && thisQuiz.slug}`}>Share</a>
                                </Button>

                                <Link to={`/review-quiz/${newScoreId && newScoreId}`} state={scoreToSave}>
                                    <Button outline color='info' className='mt-3 mt-sm-0 share-btn mx-1 mx-md-0'>
                                        Review Answers
                                    </Button>
                                </Link>

                                {(uRole === 'Admin' || uRole === 'SuperAdmin') &&
                                    <PDFDownloadLink document={<PdfDocument review={quizToReview} />} className="mt-sm-0 share-btn mx-1 mx-md-0" fileName={`${thisQuiz && thisQuiz.title}-shared-by-Quiz-Blog.pdf`}>
                                        {({ blob, url, loading, error }) => loading ? <small className="text-warning">Loading document...</small> :
                                            <Button color="success"
                                                className="mt-sm-0 share-btn mx-1 mx-md-0">
                                                Download PDF
                                            </Button>
                                        }
                                    </PDFDownloadLink>}

                                <ReviewForm isOpen={modalOpen} toggle={toggleModal} onSubmit={submitReview} quiz={thisQuiz && thisQuiz._id} score={mongoScoreId} />
                            </> :

                            <button type='button' onClick={toggleL} className='text-primary mt-3 mt-sm-0 me-2 me-md-0' style={{ backgroundColor: '#ffc107', border: '2px solid #157A6E', borderRadius: '10px', padding: '5px 12px', fontSize: '0.8rem' }}>
                                Login to review answers
                            </button>
                        }
                    </div>

                    <MarksStatus
                        score={marks}
                        qnLength={qnsLength}
                        passMark={passMark} />
                </div>
            </div>

            <>
                <SimilarQuizes
                    thisQId={thisQuiz && thisQuiz._id}
                    categories={categories.allcategories}
                    categoryId={thisQuiz.category && thisQuiz.category._id} />

                <Suspense fallback={<QBLoadingSM />}>
                    <div className='w-100'>
                        {process.env.NODE_ENV !== 'development' ? <ResponsiveAd /> : null}
                    </div>
                </Suspense>

                {thisQuiz && thisQuiz.category && thisQuiz.category.courseCategory &&
                    <RelatedNotes
                        ccatgID={thisQuiz.category.courseCategory} />
                }

                <Suspense fallback={<QBLoadingSM />}>
                    {process.env.NODE_ENV !== 'development' ? <GridMultiplex /> : null}
                </Suspense>
            </>
        </>
    )
}

export default QuizResults