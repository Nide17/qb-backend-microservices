import React, { useEffect } from 'react'
import moment from 'moment'
import { Media, Alert } from 'reactstrap'
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import { getBlogPosts } from '@/redux/slices'
import { useSelector, useDispatch } from "react-redux"
import altImage from '@/images/dashboard.svg'
import './relatedLatest.css'

const LatestPosts = () => {

    // Redux
    const dispatch = useDispatch()
    const bposts = useSelector(state => state.blogPosts)

    // Lifecycle methods
    useEffect(() => {
        dispatch(getBlogPosts({}))
    }, [dispatch])

    return (
        bposts.isLoading ?
            <QBLoadingSM /> :

            <div className="similar-posts mt-4 mt-lg-2">
                <Alert className='border border-warning text-uppercase'>
                    Latest Posts
                </Alert>

                {bposts && bposts.blogPosts && bposts.blogPosts.slice(0, 5).map((blogPost) => (

                    <Media key={blogPost._id} className="mt-1 mt-lg-2 p-3 border-bottom blogPost-title d-flex flex-column flex-lg-row">

                        <Media left href="#" className="m-auto d-flex justify-content-center align-items-center relatedLatestImage">
                            <img src={blogPost.post_image || altImage} alt={blogPost.brand} />
                        </Media>

                        <Media body className="w-100">
                            <Media heading className="pl-2 py-lg-0 mb-0 h-100 d-flex flex-column justify-content-between">

                                <p className="text-start mt-3 mt-lg-0 mb-2 post-link">
                                    <a href={`/view-blog-post/${blogPost.slug}`} className="fw-light">{blogPost.title}</a>
                                </p>

                                <div className="text-muted m-0">
                                    <p className="mb-1 ms-1">
                                        {blogPost.postCategory && blogPost.postCategory.title}
                                    </p>
                                </div>

                                <div className="d-flex ms-1 justify-content-between text-muted align-bottom">
                                    <small>
                                        {blogPost.creator && blogPost.creator.name}
                                    </small>

                                    <small className={`text-primary`}>
                                        {moment(blogPost && blogPost.createdAt).format('YYYY-MM-DD')}
                                    </small>

                                </div>
                            </Media>

                        </Media>

                    </Media>
                ))}
            </div>
    )
}

export default LatestPosts