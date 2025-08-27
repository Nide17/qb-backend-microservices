import React, { useEffect, useState } from 'react'
import { Col, Row, Button, ListGroup, ListGroupItem } from 'reactstrap'
import { useSelector, useDispatch } from "react-redux"
import { Link } from 'react-router-dom'
import moment from 'moment'
import ResponsiveAd from '../../adsenses/ResponsiveAd'
import SquareAd from '../../adsenses/SquareAd'

import { getBlogPosts } from '../../../redux/slices'
import './homePosts.css'
import QBLoading from '../../rLoading/QBLoading'

const BlogPosts = () => {

    // Redux
    const dispatch = useDispatch()
    const { blogPosts: AllBPs, isLoading } = useSelector(state => state.blogPosts)

    const [limit] = useState(10)

    // Lifecycle methods
    useEffect(() => {
        dispatch(getBlogPosts({ limit }))
    }, [dispatch, limit])

    return (
        <div className='blogPosts'>
            <Row sm="12" className="px-1 px-lg-4 my-1">

                {/* Google responsive 1 ad */}
                <div className='w-100'>
                    {process.env.NODE_ENV !== 'development' ? <ResponsiveAd /> : null}
                </div>
            </Row>

            <Row className="p-2 p-sm-3 px-sm-5">
                <Col sm="12" className="py-lg-3 px-0">
                    <h3 className="inversed-title mt-0 my-lg-3 py-4 py-lg-3 text-danger text-center fw-bolder">
                        <span className="part1">New Insights:</span>
                        <span className="part2">Latest Blog Posts</span>
                    </h3>

                    {isLoading ?
                        <>
                            <QBLoading />
                        </> :
                        <>
                            {AllBPs && AllBPs
                                .map(bp => {

                                    const { _id, slug, title, postCategory, creator, createdAt } = bp

                                    return (
                                        <React.Fragment key={_id}>
                                            <ListGroup flush color="warning" className="px-lg-3 my-1" style={{ background: "#e7e7e7" }}>
                                                <ListGroupItem key={_id} href="#" tag="span" color="alert-link" className='d-flex flex-column flex-lg-row justify-content-between align-items-center' style={{ background: "#e7e7e7" }}>

                                                    <Link to={`/view-blog-post/${slug}`} className="w-100">
                                                        <b className='text-uppercase text-primary post-title'>{title}</b>
                                                    </Link>

                                                    <span className="w-100 text-dark view-blog-post">
                                                        <small className='px-1'>
                                                            {postCategory && postCategory.title} |
                                                        </small>
                                                        {creator && creator.name &&
                                                            <small className='px-1'>
                                                                {creator.name} |
                                                            </small>}
                                                        <small className='px-1'>
                                                            {moment(new Date(createdAt)).format('DD MMM YYYY, HH:mm')}
                                                        </small>
                                                    </span>
                                                </ListGroupItem>
                                            </ListGroup>

                                            {/* ad when half the number of notes*/}
                                            {AllBPs.length > 2 && AllBPs.indexOf(bp) === Math.floor(AllBPs.length / 2) &&
                                                <div className='w-100'>
                                                    {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                                                </div>
                                            }
                                        </React.Fragment>)
                                }
                                )}

                            {/* All posts */}
                            <div className="my-4 mt-sm-5 mb-sm-4 d-flex justify-content-center">
                                <Link to="/blog">
                                    <Button outline color="warning" className='view-all-btn'>
                                        More articles here &nbsp;<span role="img" aria-label="pointing">👉</span>
                                    </Button>
                                </Link>
                            </div>
                        </>
                    }
                </Col>
            </Row>
        </div>
    )
}

export default BlogPosts