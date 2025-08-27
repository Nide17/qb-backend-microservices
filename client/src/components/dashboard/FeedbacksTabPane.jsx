import React, { useState, useEffect } from 'react'
import { Row, TabPane } from 'reactstrap'
import Pagination from './Pagination'
import PageOf from './PageOf'
import FeedbacksTable from './FeedbacksTable'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { getFeedbacks } from '../../redux/slices/feedbacksSlice'
import { useSelector, useDispatch } from 'react-redux'

const FeedbacksTabPane = () => {

    // Redux
    const dispatch = useDispatch()
    const feedbacks = useSelector(state => state.feedbacks)
    const { allFeedbacks, isLoading, totalPages } = feedbacks

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uId = currentUser && currentUser._id
    const uRole = currentUser && currentUser.role

    const [pageNo, setPageNo] = useState(1)
    const [numberOfPages, setNumberOfPages] = useState(0)

    // Lifecycle methods
    useEffect(() => {
        if (uRole !== 'Visitor') {
            dispatch(getFeedbacks(pageNo))
            setNumberOfPages(totalPages && totalPages)
        }
    }, [dispatch, uRole, uId, pageNo, totalPages])

    return (

        <TabPane tabId="3">
            {
                isLoading ?
                    <QBLoadingSM title='feedbacks' /> :

                    <Row>
                        {(uRole !== 'Visitor') ?
                            <PageOf pageNo={pageNo} numberOfPages={numberOfPages} /> : null}

                        <FeedbacksTable
                            feedbacksToUse={allFeedbacks && allFeedbacks}
                            pageNo={pageNo} />

                        {uRole !== 'Visitor' ?
                            <>
                                <Pagination pageNo={pageNo} setPageNo={setPageNo} numberOfPages={numberOfPages} />
                            </> : null}
                    </Row>}
        </TabPane>
    )
}

export default FeedbacksTabPane