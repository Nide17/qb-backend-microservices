import React, { useEffect } from 'react'
import { Row, TabPane } from 'reactstrap'

import { getBlogPosts } from '../../../redux/slices'
import { useSelector, useDispatch } from "react-redux"
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import BPTable from './BPTable'

const BlogPostsTabPane = () => {

    // Redux
    const dispatch = useDispatch()
    const bposts = useSelector(state => state.blogPosts)
    const { isLoading, blogPosts } = bposts

    // Lifecycle methods
    useEffect(() => {
        dispatch(getBlogPosts({}))
    }, [dispatch])

    return (
        <TabPane tabId="7" className='mx-4 my-5'>
            {isLoading ?
                <QBLoadingSM /> :
                <Row>
                    <BPTable bpostsToUse={blogPosts && blogPosts} />
                </Row>
            }
        </TabPane>
    )
}

export default BlogPostsTabPane