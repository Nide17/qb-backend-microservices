import React, { useState, useEffect, useContext } from 'react'
import { Row, Col, TabContent, Nav, NavItem, NavLink, Button } from 'reactstrap'
import classnames from 'classnames'
import ScoresTabPane from './ScoresTabPane'
import FeedbacksTabPane from './FeedbacksTabPane'
import CategoriesTabPane from '../categories/CategoriesTabPane'
import QuizesTabPane from '../quizes/QuizesTabPane'
import UsersTabPane from '../users/UsersTabPane'
import PostCategoriesTabPane from '../blog/bPCategories/PostCategoriesTabPane'
import BlogPostsTabPane from '../blog/blogPosts/BlogPostsTabPane'
import DownloadsTabPane from './DownloadsTabPane'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import CommentsTabPane from '../quizes/review/questionComments/CommentsTabPane'
import AdvertsTabPane from './adverts/AdvertsTabPane'
import TopRow from './TopRow'
import { logRegContext } from '../../appContexts'
import { useSelector } from 'react-redux'

const Dashboard = () => {

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const isAuthenticated = useSelector(state => state.auth && state.auth.isAuthenticated)
    const { toggleL } = useContext(logRegContext)

    // State
    const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || '1')

    // Lifecycle methods
    useEffect(() => {
        if (currentUser && currentUser.role === 'Visitor') {
            setActiveTab('4')
        }
    }, [currentUser])

    const toggle = tab => {
        if (activeTab !== tab) {
            setActiveTab(tab)
            localStorage.setItem('activeTab', tab)
        }
    }

    // render
    return (isAuthenticated ?
        <>
            <TopRow />
            <Row className="m-lg-5 mx-2">
                <Col sm="12" className="px-0 mb-4 mb-sm-0 d-flex justify-content-around">

                    <Nav tabs className="dashboard-navbar d-block d-sm-flex mb-0 mb-lg-5 p-2 border rounded border-success bg-light text-uppercase fw-bolder">

                        {
                            // If the user is Admin or Creator
                            currentUser.role !== 'Visitor' ?
                                <>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === '1' })}
                                            onClick={() => { toggle('1') }}>
                                            <u>Categories</u>
                                        </NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === '2' })}
                                            onClick={() => { toggle('2') }}>
                                            <u>Quizes</u>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === '3' })}
                                            onClick={() => { toggle('3') }}>
                                            <u>Feedbacks</u>
                                        </NavLink>
                                    </NavItem>
                                </> : null}

                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === '4' })}
                                onClick={() => { toggle('4') }}>
                                <u>Scores</u>
                            </NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === '5' })}
                                onClick={() => { toggle('5') }}>
                                <u>Downloads</u>
                            </NavLink>
                        </NavItem>

                        { // CAUSING PROBLEMS WHEN VISITOR IS LOGGED IN
                            currentUser.role !== 'Visitor' ?
                                <>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === '6' })}
                                            onClick={() => { toggle('6') }}>
                                            <u>BP Categories</u>
                                        </NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === '7' })}
                                            onClick={() => { toggle('7') }}>
                                            <u>Blog Posts</u>
                                        </NavLink>
                                    </NavItem> </> : null}

                        {
                            // Admin only
                            currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ?
                                <>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === '8' })}
                                            onClick={() => { toggle('8') }}>
                                            <u>Users</u>
                                        </NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === '9' })}
                                            onClick={() => { toggle('9') }}>
                                            <u>Comments</u>
                                        </NavLink>
                                    </NavItem>

                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === '10' })}
                                            onClick={() => { toggle('10') }}>
                                            <u>Adverts</u>
                                        </NavLink>
                                    </NavItem>

                                </> : null
                        }
                    </Nav>
                </Col>

                <Col sm="12" className="px-0">
                    <TabContent activeTab={activeTab}>

                        {currentUser.role !== 'Visitor' ?
                            <>
                                <CategoriesTabPane />
                                <QuizesTabPane />
                            </> : null}

                        {/* Any user authenticated */}
                        <FeedbacksTabPane />
                        <ScoresTabPane />
                        <DownloadsTabPane />

                        { // CAUSING PROBLEMS WHEN VISITOR IS LOGGED IN
                            currentUser.role !== 'Visitor' ?
                                <>
                                    <PostCategoriesTabPane />
                                    <BlogPostsTabPane />
                                </> : null}

                        {currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ?
                            <>
                                <UsersTabPane />
                                <CommentsTabPane />
                                <AdvertsTabPane />
                            </> : null}
                    </TabContent>
                </Col>
            </Row>
        </> :

        // If not authenticated or loading
        <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
            {
                auth.isLoading ?
                    <QBLoadingSM /> :
                    <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                        Login first
                    </Button>
            }
        </div>)
}

export default Dashboard