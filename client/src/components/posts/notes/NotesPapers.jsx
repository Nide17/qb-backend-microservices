import React, { useEffect, useState, lazy, Suspense } from 'react'
import { Col, Row, Button } from 'reactstrap'

import { Link } from 'react-router-dom'
import { getLandingDisplayNotes } from '../../../redux/slices/notesSlice'
import { useSelector, useDispatch } from 'react-redux'
import PostItemPlaceholder from '../../rLoading/PostItemPlaceholder'
import ResponsiveAd from '../../adsenses/ResponsiveAd'

const SquareAd = lazy(() => import('../../adsenses/SquareAd'))
const SideResizable = lazy(() => import('../../adsenses/SideResizable'))
const ResponsiveHorizontal = lazy(() => import('../../adsenses/ResponsiveHorizontal'))
const GridMultiplex = lazy(() => import('../../adsenses/GridMultiplex'))
const InFeedAd = lazy(() => import('../../adsenses/InFeedAd'))
const NotesPapersItem = lazy(() => import('./NotesPapersItem'))

const NotesPapers = () => {

    // Redux
    const dispatch = useDispatch()
    const notes = useSelector(state => state.notes)
    const limitedLandingDisplayNotes = notes && notes.limitedLandingDisplayNotes

    const [limit] = useState(10)

    // Lifecycle methods
    useEffect(() => {
        dispatch(getLandingDisplayNotes(limit))
    }, [dispatch, limit])

    return (

        <div style={{ background: "#eeeded" }}>
            <Row className="px-1 px-lg-4 my-1 w-100">
                {/* Google responsive 1 ad */}
                <Col sm="12">
                    <div className='w-100'>
                        {process.env.NODE_ENV !== 'development' ? <ResponsiveAd /> : null}
                    </div>
                </Col>
            </Row>

            <Row className="px-1 px-lg-4 my-1 w-100">
                <Col sm="6" className='p-1 p-lg-2 d-flex flex-column justify-content-around w-100'>
                    <Suspense fallback={<PostItemPlaceholder />}>
                        <div className='w-100'>
                            {process.env.NODE_ENV !== 'development' ? <SideResizable /> : null}
                        </div>
                    </Suspense>
                </Col>
                <Col sm="6" className='w-100'>
                    <div className='w-100'>
                        {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                    </div>
                </Col>
            </Row>

            <Row className="m-1 p-1 px-sm-5 notes-paper">
                <Col sm="12" className="px-1 y-1 w-100">
                    <h3 className="inversed-title mt-0 my-lg-3 py-4 py-lg-3 text-danger text-center fw-bolder">
                        <span className="part1">Your Resource:</span>
                        <span className="part2">Notes & Past Papers</span>
                    </h3>
                </Col>

                <Col sm="12" className="px-0 px-sm-5 w-100">

                    {notes.isLoading ?
                        <>
                            <PostItemPlaceholder />
                            <PostItemPlaceholder />
                            <PostItemPlaceholder />
                        </> :
                        <>
                            {limitedLandingDisplayNotes && limitedLandingDisplayNotes
                                .map(note => (
                                    <Suspense key={note._id} fallback={<PostItemPlaceholder />}>
                                        <NotesPapersItem note={note} />

                                        {/* Google in-feed ad when half the number of notes*/}
                                        {limitedLandingDisplayNotes.length > 0 && limitedLandingDisplayNotes.indexOf(note) === Math.floor(limitedLandingDisplayNotes.length / 2) ?
                                            <Col sm="12" className="w-100">
                                                {process.env.NODE_ENV !== 'development' ? <InFeedAd /> : null}
                                            </Col> : null}

                                    </Suspense>
                                ))}


                            {/* Newest 10 notes */}
                            {limitedLandingDisplayNotes && limitedLandingDisplayNotes.length > 0 ?

                                <div className="mt-4 mt-sm-5 mb-sm-4 d-flex justify-content-center">
                                    <Link to="/course-notes">
                                        <Button outline color="info" className='view-all-btn'>
                                            More Notes & Past Papers &nbsp; <i className="fa fa-arrow-right"></i>
                                        </Button>
                                    </Link>
                                </div> :
                                null}

                            <Suspense fallback={<PostItemPlaceholder />}>
                                {process.env.NODE_ENV !== 'development' ? <GridMultiplex /> : null}
                            </Suspense>
                        </>
                    }
                </Col>
            </Row>

            <Row className="my-1 w-100">
                <Col sm="12" className="px-1 y-1 w-100">
                    <Suspense fallback={<PostItemPlaceholder />}>
                        <div className='w-100'>
                            {process.env.NODE_ENV !== 'development' ? <ResponsiveHorizontal /> : null}
                        </div>
                    </Suspense>
                </Col>
            </Row>
        </div>
    )
}

export default NotesPapers