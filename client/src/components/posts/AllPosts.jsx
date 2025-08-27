import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Container, Col, Row, Button } from 'reactstrap'
import { getQuizes, getAllNoLimitQuizes } from '../../redux/slices/quizesSlice'
import { useSelector, useDispatch } from "react-redux"
import ResponsiveAd from '../adsenses/ResponsiveAd'
import SquareAd from '../adsenses/SquareAd'
import SearchInput from '../../utils/SearchInput'
import QBLoadingSM from '../rLoading/QBLoadingSM'

const PostItem = lazy(() => import('./PostItem'))

const Posts = () => {

    // Redux
    const allQuizesNoLimit = useSelector(state => state.quizes.allQuizesNoLimit)
    const quizesPage = useSelector(state => state.quizes.limitedQuizes)
    const isLoading = useSelector(state => state.quizes.isLoading)
    const dispatch = useDispatch()

    const [limit] = useState(20)
    const [skip, setSkip] = useState(0)
    const [searchKey, setSearchKey] = useState('')

    const nextPage = () => {
        setSkip(skip + limit)
    }

    const previousPage = () => {
        setSkip(skip - limit)
    }

    // Lifecycle methods
    useEffect(() => {
        dispatch(getQuizes(skip, limit))
        dispatch(getAllNoLimitQuizes())
    }, [dispatch, skip, limit])

    const mystyle = {
        color: "#157A6E",
        textAlign: "center",
        animationDuration: "2s",
        animationName: "slidein",
        animationIterationCount: "infinite",
        animationDirection: "alternate"
    }

    return (
        <Container className="posts main mt-4">

            <blockquote className="blockquote text-center mt-3 mt-sm-5">
                <h1 className="mb-4 lead text-uppercase fw-bolder">Knowledge matters, and so does the joy of quizzing!</h1>
                <small className="text-muted mt-2 p-1 m-lg-4">
                    &nbsp;~&nbsp; Welcome! Explore and test your knowledge as you please! &nbsp;~&nbsp;
                </small>
            </blockquote>

            <Row className="my-5 mx-0">
                <div style={mystyle}>
                    <h4 className='d-inline rounded p-lg-1' style={{ backgroundColor: '#ffc107', color: '#157A6E', border: '2px solid #157A6E' }}>
                        Get ready for exam success! Let's make it happen together!<span role="img" aria-label="pointing">🍾🎉</span></h4>
                </div>
            </Row>

            <Row className="mt-lg-5">
                <Col sm="2" className="mt-md-2 d-flex justify-content-center align-items-center">
                    {/* Google responsive 1 ad */}
                    <div className='w-100 d-flex justify-content-center align-items-center'>
                        {process.env.NODE_ENV !== 'development' ? <ResponsiveAd /> : null}
                    </div>
                </Col>

                <Col sm="8" className="mt-md-2">
                    <Suspense
                        fallback={<QBLoadingSM />}>
                        <h3 className="mb-3 text-center lead fw-bolder">Entire Quiz Selection</h3>
                        {isLoading ?

                        <div className="mt-5 pt-5 d-flex justify-content-center align-items-center">
                            <QBLoadingSM />
                        </div> :

                            <>

                                {/* Search input*/}
                                {
                                    isLoading ?
                                        <div className="p-1 m-1 d-flex justify-content-center align-items-center">
                                            <QBLoadingSM />  </div> :
                                        <SearchInput setSearchKey={setSearchKey} placeholder=" Search quizes here ...  " />
                                }

                                {searchKey === "" ? null :

                                    allQuizesNoLimit && allQuizesNoLimit
                                        .map(quiz => (

                                            quiz.title.toLowerCase().includes(searchKey.toLowerCase()) ?
                                                <PostItem key={quiz._id} quiz={quiz} fromSearch={true} /> : null
                                        ))}

                                {quizesPage && quizesPage.map(quiz => (
                                    quiz.questions.length > 5 ?
                                        <PostItem key={quiz._id} quiz={quiz} /> :
                                        null
                                ))}

                                <div className="w-100 d-flex justify-content-around mx-auto my-3 overflow-auto pb-2">
                                    <Button onClick={previousPage} className={skip < 1 ? `invisible` : `visible`} style={{ backgroundColor: '#157A6E', color: '#ffc107' }} >
                                        Previous
                                    </Button>
                                    <Button onClick={nextPage} className={quizesPage.length < limit ? `invisible` : `visible`} style={{ backgroundColor: '#157A6E', color: '#ffc107' }} >
                                        Next
                                    </Button>
                                </div>
                            </>}
                    </Suspense>
                </Col>

                <Col sm="2" className="mt-md-2 w-100 d-flex justify-content-center align-items-center">
                    {/* Google square ad */}
                    <Row className='w-100 d-flex justify-content-center align-items-center'>
                        <Col sm="12" className='d-flex justify-content-center align-items-center'>
                            <div className='w-100 d-flex justify-content-center align-items-center'>
                                {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}

export default Posts