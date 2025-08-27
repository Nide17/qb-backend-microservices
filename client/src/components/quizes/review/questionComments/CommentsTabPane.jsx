import React, { useState, useEffect } from 'react'
import { Col, Row, TabPane, Card, Alert, ListGroup, Button } from 'reactstrap'
import QBLoadingSM from '../../../rLoading/QBLoadingSM'
import { getAllQuestionsComments, getPaginatedQuestionsComments } from '../../../../redux/slices/questionsCommentsSlice'
import { getAllQuizzesComments } from '../../../../redux/slices/quizzesCommentsSlice'
import { useSelector, useDispatch } from 'react-redux'
import Comment from './Comment'
import PendingComments from './PendingComments'
import SearchInput from '../../../../utils/SearchInput'
import Pagination from '../../../dashboard/Pagination'
import PageOf from '../../../dashboard/PageOf'

const CommentsTabPane = () => {

    // Local state
    const [pageNo, setPageNo] = useState(1)
    const [numberOfPages, setNumberOfPages] = useState(0)
    const [searchKey, setSearchKey] = useState('')
    const [searchKeyQ, setSearchKeyQ] = useState('')
    const [showAll, setShowAll] = useState(false)

    // Redux
    const dispatch = useDispatch()
    const { allQuizzesComments } = useSelector(state => state.quizzesComments)
    const { allQuestionsComments, paginatedComments, isLoading } = useSelector(state => state.questionsComments)
    console.log(isLoading)
    const auth = useSelector(state => state.auth)

    const currentUser = auth && auth.user
    const totPages = allQuestionsComments && allQuestionsComments.totalPages
    const uRole = currentUser && currentUser.role

    // Lifecycle methods
    useEffect(() => {
        dispatch(getAllQuestionsComments())
        dispatch(getAllQuizzesComments())
    }, [dispatch])

    useEffect(() => { dispatch(getPaginatedQuestionsComments(pageNo)) }, [dispatch, pageNo])
    useEffect(() => { setNumberOfPages(totPages) }, [totPages])

    const filteredQuestionsComments = filterComments(allQuestionsComments, searchKeyQ)
    const filteredQuizComments = filterComments(allQuizzesComments, searchKey)

    return (
        <TabPane tabId="9">
            <Row>
                <PendingComments />
            </Row>
            <Row>
                {paginatedComments && paginatedComments.length > 0 ?
                    <>
                        {(uRole === 'Admin' || uRole === 'SuperAdmin') && <PageOf pageNo={pageNo} numberOfPages={numberOfPages} />}
                        {renderSearchBars(isLoading, setSearchKeyQ, setSearchKey)}
                        <Row>
                            <ListGroup>
                                {filteredQuestionsComments.map(cmnt => <Comment comment={cmnt} key={cmnt._id} />)}
                            </ListGroup>
                        </Row>
                        <Row>
                            <ListGroup>
                                {filteredQuizComments.map(cmnt => <Comment comment={cmnt} key={cmnt._id} uRole={uRole} />)}
                            </ListGroup>
                        </Row>
                        <Row>
                            <Col sm={12} className="mt-2 comments-card">
                                <Card body>
                                    {paginatedComments.map((comment, i) => <Comment comment={comment} key={i} uRole={uRole} />)}
                                    {renderShowAllButton(showAll, setShowAll, allQuizzesComments, uRole)}
                                </Card>
                            </Col>
                        </Row>
                        {uRole !== 'Visitor' && <Pagination pageNo={pageNo} setPageNo={setPageNo} numberOfPages={numberOfPages} />}
                    </> :
                    <Alert color="danger" className="w-100 text-center my-3">
                        ...
                    </Alert>}
            </Row>
        </TabPane>
    )
}

const filterComments = (comments, searchKey) => {
    return comments && comments.filter(cmnt =>
        searchKey === "" ? false : cmnt.comment.toLowerCase().includes(searchKey.toLowerCase())
    )
}

const renderSearchBars = (isLoading, setSearchKeyQ, setSearchKey) => {
    return <Row className="mt-0 w-100">
        <Col sm="6">
            <SearchInput setSearchKey={setSearchKeyQ} placeholder=" Search question comments here ...  " />
        </Col>
        <Col sm="6">
            <SearchInput setSearchKey={setSearchKey} placeholder=" Search quiz comments here ...  " />
        </Col>
    </Row>
}

const renderShowAllButton = (showAll, setShowAll, allQuizzesComments, uRole) => {
    return <>
        {allQuizzesComments.length > 0 && allQuizzesComments.map((comment, i) =>
            showAll && <Comment comment={comment} key={i} uRole={uRole} />)}
        <Button color="warning" outline className='mt-2 mx-auto d-block text-success text-uppercase fw-bolder'
            onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Hide' : 'Show'} all old quizes comments
        </Button>
    </>
}

export default CommentsTabPane