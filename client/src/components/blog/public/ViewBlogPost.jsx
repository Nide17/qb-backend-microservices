import React, { useState, useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import { useParams } from 'react-router-dom'
import { Container, Row, Col } from 'reactstrap'
import moment from 'moment'
import { getOneBlogPost } from '../../../redux/slices'
import { createBlogPostView } from '../../../redux/slices/blogPostsViewsSlice'
import { useSelector, useDispatch } from "react-redux"
import RelatedPosts from './RelatedPosts'
import LatestPosts from './LatestPosts'
import altImage from '../../../images/dashboard.svg'
import BackLikeShare from './BackLikeShare'
import FollowUs from './FollowUs'
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import './viewPost.css'

// Function to fetch IP address and country
const fetchCountryData = async () => {
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        const ipAddress = ipData.ip
        console.log(`IP address: ${ipAddress}`)
        const geoResponse = await fetch(`https://get.geojs.io/v1/ip/geo/${ipAddress}.json`)
        const geoData = await geoResponse.json()
        return geoData.country
    } catch (error) {
        console.error(error)
        return null
    }
}

const ViewBlogPost = () => {
    const dispatch = useDispatch()
    const { bPSlug } = useParams()
    const bposts = useSelector(state => state.blogPosts)

    useEffect(() => { dispatch(getOneBlogPost(bPSlug)) }, [dispatch, bPSlug])

    const bpToUse = bposts && bposts.oneBlogPost
    const bPCatID = bpToUse && bpToUse.postCategory && bpToUse.postCategory._id

    const viewer = useSelector(state => state.auth && state.auth.user)
    const [newBlogPostView, setNewBlogPostView] = useState()

    useEffect(() => {
        const updateBlogPostView = async () => {
            const country = await fetchCountryData()
            setNewBlogPostView({
                blogPost: bpToUse && bpToUse._id,
                viewer: viewer && viewer._id,
                device: navigator.userAgent.match(/Android|iPhone|iPad|iPod|Windows Phone/i) ? 'mobile' : 'desktop',
                country
            })
        }
        updateBlogPostView()
    }, [viewer, bpToUse])

    const isCreateCalled = useRef(false)

    useEffect(() => {
        if (newBlogPostView && newBlogPostView.blogPost && !isCreateCalled.current) {
            dispatch(createBlogPostView(newBlogPostView))
            isCreateCalled.current = true
        }
    }, [newBlogPostView, dispatch])

    return (
        <Container className="blog-post-view p-0 p-lg-5 mw-100" style={{ backgroundColor: (bpToUse && bpToUse.bgColor) || '#f3f3f2' }}>
            <Row className="viewed-details pb-lg-2">
                <Col sm="8" className="mx-0 py-2 px-0 pl-lg-2 ps-lg-4 choosen-blogPost">
                    {bposts.isLoading ? <QBLoadingSM /> :
                        <>
                            <BackLikeShare articleName={bpToUse.title} articleCreator={bpToUse.creator && bpToUse.creator.name} />
                            <div className="post-details px-2 px-lg-3 py-lg-4">
                                <h2 className="blogPost-title fw-bolder my-3 text-uppercase text-center">
                                    <p className='text-center'>{bpToUse.title}</p>
                                    <small>
                                        <b>
                                            Posted by {bpToUse.creator && bpToUse.creator.name} on {moment(new Date(bpToUse && bpToUse.createdAt)).format('DD MMM YYYY, HH:mm')}
                                        </b>
                                    </small>
                                </h2>
                                <div className="post-photo">
                                    <img src={bpToUse.post_image || altImage} alt="" />
                                </div>
                                <Markdown rehypePlugins={[rehypeHighlight]}>{bpToUse.markdown}</Markdown>
                            </div>
                            <BackLikeShare articleName={bpToUse.title} articleCreator={bpToUse.creator && bpToUse.creator.name} />
                            <FollowUs />
                        </>}
                </Col>
                <Col sm="4" className="sidebar-content">
                    <RelatedPosts bPCatID={bPCatID} />
                    <LatestPosts />
                </Col>
            </Row>
        </Container>
    )
}

export default ViewBlogPost