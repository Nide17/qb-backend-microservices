import React, { useEffect } from 'react'
import { Col, Card, Alert } from 'reactstrap'
import QBLoadingSM from '../../../rLoading/QBLoadingSM'
import { getPendingQnsComments } from '../../../../redux/slices/questionsCommentsSlice'
import { useSelector, useDispatch } from 'react-redux'
import Comment from './Comment'

const renderLoading = () => (
    <div className="p-1 m-1 d-flex justify-content-center align-items-center">
        <QBLoadingSM />
    </div>
)

const renderComments = (pendingComments, uRole) => (
    <>
        <h5 className='text-center w-100 my-4 fw-bolder'>
            PENDING COMMENTS ({pendingComments.length})
        </h5>
        <Col sm={12} className="mt-2 comments-card">
            <Card body>
                {pendingComments.map((comment, i) => (
                    <Comment comment={comment} isFromPending={true} uRole={uRole} key={i} />
                ))}
            </Card>
        </Col>
    </>
)

const renderNoComments = () => (
    <Alert color="success" className="w-100 text-center">
        Hooray, wait! ...
    </Alert>
)

const PendingComments = () => {
    // Redux
    const dispatch = useDispatch()
    const { pendingComments, isLoading } = useSelector(state => state.questionsComments)
    const { user } = useSelector(state => state.auth)
    const uRole = user?.role

    // Lifecycle methods
    useEffect(() => { dispatch(getPendingQnsComments()) }, [dispatch])

    return pendingComments.length > 0 ? renderComments(pendingComments, uRole) : renderNoComments()
}

export default PendingComments