import React, { useState, useEffect } from 'react'
import { Col, Row, CardTitle, Card, Button } from 'reactstrap'
import QBLoadingSM from '../../../rLoading/QBLoadingSM'
import { getCommentsByQuiz, getOneQuestionComments } from '../../../../redux/slices/questionsCommentsSlice'
import { getOneQuizComments } from '../../../../redux/slices/quizzesCommentsSlice'
import { useSelector, useDispatch } from 'react-redux'
import Comment from './Comment'
import AddComment from './AddComment'

const QuestionComments = ({ questionID, quizID, fromSingleQuestion }) => {

  const dispatch = useDispatch()
  const { commentsByQuiz } = useSelector(state => state.questionsComments)
  const { oneQuestionComments } = useSelector(state => state.questionsComments)
  const { oneQuizComments } = useSelector(state => state.quizzesComments)
  const auth = useSelector(state => state.auth)
  const currentUser = auth && auth.user

  // Lifecycle methods
  useEffect(() => {
    dispatch(getCommentsByQuiz(quizID))
    dispatch(getOneQuestionComments(questionID))
    dispatch(getOneQuizComments(quizID))
  }, [dispatch, questionID, quizID])
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <Row className="mt-5">
        <Col sm={12} className="mt-2 comments-card">
          <Card body>
            <AddComment question={questionID} quiz={quizID} fromSingleQuestion={fromSingleQuestion} />
          </Card>
        </Col>
        {oneQuestionComments && oneQuestionComments.length > 0 && (
          <Col sm={12} className="mt-2 comments-card">
            <Card body>
              <CardTitle tag="h2" className="w-100 py-2 py-lg-4 text-center fw-bolder">
                Comments on this question
              </CardTitle>
              <CommentsList comments={oneQuestionComments} currentUser={currentUser} />
            </Card>
          </Col>
        )}
      </Row>
      <hr />
      <Row>
        {commentsByQuiz && commentsByQuiz.length > 0 && (
          <Col sm={12} className="mt-2 comments-card">
            {showAll && (
              <Card body>
                <CardTitle tag="h2" className="w-100 py-2 py-lg-4 text-center fw-bolder">
                  All comments for this quiz
                </CardTitle>
                <CommentsList comments={commentsByQuiz} currentUser={currentUser} showQuestionText />
                <CommentsList comments={oneQuizComments} currentUser={currentUser} />
              </Card>
            )}
            <Button color="warning" outline className='mt-2 mx-auto d-block text-success text-uppercase fw-bolder'
              onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Hide' : 'Show'} all comments for this quiz
            </Button>
          </Col>
        )}
      </Row>
    </>
  )
}

const CommentsList = ({ comments, currentUser, showQuestionText }) => (
  <>
    {comments && comments.map((comment, i) => (
      <div key={i} className='border border-secondary rounded m-1 p-2'>
        {showQuestionText && (
          <small className='text-uppercase fw-bolder py-2 mt-4'>
            {comment.question.questionText}
          </small>
        )}
        <Comment comment={comment} uRole={currentUser && currentUser.role} />
      </div>
    ))}
  </>
)

export default QuestionComments