import React, { useState, useEffect } from 'react'
import { Row, Col, TabPane, ListGroup, ListGroupItem, Alert } from 'reactstrap'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { getQuestions } from '../../redux/slices/questionsSlice'
import { getPaginatedQuizes, getAllNoLimitQuizes } from '../../redux/slices/quizesSlice'
import { useSelector, useDispatch } from 'react-redux'
import QuizToast from './QuizToast'
import SearchInput from '../../utils/SearchInput'
import Pagination from '../dashboard/Pagination'
import PageOf from '../dashboard/PageOf'


const QuizesTabPane = () => {

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const categories = useSelector(state => state.categories)

    // Redux
    const dispatch = useDispatch()
    const quizes = useSelector(state => state.quizes)
    const questions = useSelector(state => state.questions)

    const [pageNo, setPageNo] = useState(1)
    const [numberOfPages, setNumberOfPages] = useState(0)
    const [searchKey, setSearchKey] = useState('')
    const [searchKeyQ, setSearchKeyQ] = useState('')

    const uRole = currentUser && currentUser.role
    const totPages = quizes && quizes.totalPages

    // Lifecycle methods
    useEffect(() => {
        dispatch(getPaginatedQuizes(pageNo))
        dispatch(getQuestions())
        dispatch(getAllNoLimitQuizes())
    }, [dispatch, pageNo])

    useEffect(() => {
        setNumberOfPages(totPages)
    }, [totPages])

    // Quizzes to use - CREATED BY ROUTE
    const allQuizzes = quizes && quizes.paginatedQuizes
    const creatorQuizzes = quizes.paginatedQuizes && quizes.paginatedQuizes
        .filter(quiz => quiz.created_by && quiz.created_by._id === currentUser._id)
    const quizzesToUse = currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ? allQuizzes : creatorQuizzes

    // Questions to use
    const allQuestions = questions && questions.questionsData
    const creatorQuestions = questions && questions.questionsData
        .filter(question => question.created_by && question.created_by._id === currentUser._id)
    const questionsToUse = currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ? allQuestions : creatorQuestions

    return (
        <TabPane tabId="2">
            {quizes.isLoading ?
                <QBLoadingSM title='paginated quizes' /> :
                quizzesToUse && quizzesToUse.length > 0 ?
                    <>
                        {(uRole === 'Admin' || uRole === 'SuperAdmin') ?
                            <PageOf pageNo={pageNo} numberOfPages={numberOfPages} /> : null}

                        {
                            // SEARCH BARS
                            quizes.isLoading || questions.isLoading ?
                                <div className="p-1 m-1 d-flex justify-content-center align-items-center">
                                    <QBLoadingSM />  </div> :
                                <Row className="mt-0">
                                    <Col sm="6">
                                        <SearchInput setSearchKey={setSearchKey} placeholder=" Search quizes here ...  " />
                                    </Col>
                                    <Col sm="6">
                                        <SearchInput setSearchKey={setSearchKeyQ} placeholder=" Search questions here ...  " />
                                    </Col>
                                </Row>
                        }

                        {/* Search questions */}
                        <Row>
                            <ListGroup>
                                {questionsToUse && questionsToUse
                                    .filter(question => {
                                        if (searchKeyQ === "") {
                                            return null
                                        } else if (question.questionText.toLowerCase().includes(searchKeyQ.toLowerCase())) {
                                            return question
                                        }
                                        return null
                                    })
                                    .map(question => (
                                        <ListGroupItem key={question._id} tag="a" href={`/view-question/${question._id}`}>
                                            {question.questionText}
                                        </ListGroupItem>
                                    ))}

                            </ListGroup>
                        </Row>

                        {/* SEARCH QUIZES */}
                        <Row>
                            {quizes.allQuizesNoLimit && quizes.allQuizesNoLimit
                                .filter(quiz => {

                                    if (searchKey === "") {
                                        return null
                                    } else if (quiz.title.toLowerCase().includes(searchKey.toLowerCase())) {
                                        return quiz
                                    }
                                    return null
                                })
                                .map(quiz => <QuizToast
                                    fromSearch={true}
                                    key={quiz._id}
                                    categories={categories}
                                    quiz={quiz && quiz} />)}
                        </Row>

                        {/* LIMITED QUIZZES */}
                        <Row>
                            {quizzesToUse && quizzesToUse
                                .map(quiz => <QuizToast
                                    key={quiz._id}
                                    categories={categories}
                                    quiz={quiz && quiz} />)}
                        </Row>

                        {/* PAGINATION */}
                        {uRole !== 'Visitor' ?
                            <>
                                <Pagination pageNo={pageNo} setPageNo={setPageNo} numberOfPages={numberOfPages} />
                            </> : null}
                    </> :
                    <Alert color="danger" className="w-50 text-center mx-auto" style={{ border: '2px solid #157A6E' }}>
                        You have not created any quiz yet!
                    </Alert>
            }
        </TabPane>
    )
}

export default QuizesTabPane