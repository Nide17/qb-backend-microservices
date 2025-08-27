import React, { useEffect, useState } from 'react'
import TableData from '../TableData'
import { useLocation } from "react-router-dom"
import QBLoadingSM from '../../../rLoading/QBLoadingSM'
import { getRecentTenViews, getBlogPostsViews } from '../../../../redux/slices/blogPostsViewsSlice'
import { useDispatch, useSelector } from 'react-redux'

const BlogStats = () => {

    // Redux
    const stats = useSelector(state => state.blogPosts)
    const dispatch = useDispatch()

    const [blogStats, setBlogStats] = useState([])
    const [blogStatsLoading, setBlogStatsLoading] = useState(false)

    // set the current route
    const location = useLocation()

    // Lifecycle method to get the data according to the current route on mount
    useEffect(() => {
        switch (location.pathname) {

            case "/statistics/recent-ten-views":
                dispatch(getRecentTenViews())
                break

            case "/statistics/all-posts-views":
                dispatch(getBlogPostsViews())
                break

            default:
                break
        }
    }, [location, getRecentTenViews, getBlogPostsViews])

    // Updating the state according to the current route and the data returned from the server
    useEffect(() => {
        switch (location.pathname) {

            case "/statistics/recent-ten-views":
                setBlogStats(stats.recentTenViews)
                setBlogStatsLoading(stats.isLoading)
                break

            case "/statistics/all-posts-views":
                setBlogStats(stats.allBlogPostsViews)
                setBlogStatsLoading(stats.isLoading)
                break

            default:
                break
        }
    }, [location, stats])

    // Generate filename 
    const filename = location.pathname.split("/")[2]

    return (
        <div style={{ position: "relative" }} className="p-1 m-1 d-flex justify-content-center align-items-center overflow-auto">

            {blogStatsLoading && blogStatsLoading ?
                <QBLoadingSM /> :

                <div className="w-100 ">
                    {
                        blogStats && blogStats.length > 0 ?
                            <TableData data={blogStats} filename={filename} /> :

                            <div className="p-1 m-1 d-flex justify-content-center align-items-center">
                                No blog stats to display
                            </div>
                    }
                </div>
            }
        </div>
    )
}

export default BlogStats