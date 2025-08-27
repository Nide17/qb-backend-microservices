import React from 'react'
import { Link } from "react-router-dom"
import EditQuiz from './EditQuiz'
import AddIcon from '../../images/plus.svg'
import { Col, Toast, ToastBody, ToastHeader } from 'reactstrap'
import { deleteQuiz } from '../../redux/slices/quizesSlice'
import DeleteModal from '../../utils/DeleteModal'

const QuizToast = ({ fromSearch, quiz }) => {

    return (
        <Col sm="3" key={quiz._id} className="mt-3 quiz-toast">
            <Toast className={fromSearch ? 'bg-info text-white py-3 px-1 px-sm-3 my-2 my-sm-3 border' : 'py-3 px-1 px-sm-3 my-2 my-sm-3 border'}>
                <ToastHeader className="d-flex justify-content-between">
                        <Link to={`/quiz-ranking/${quiz._id}`} className={`mb-0 ${fromSearch ? 'text-white' : 'text-success'} text-uppercase`}>
                            {quiz.title}
                            <small>&nbsp;(Ranking)</small>
                        </Link>

                    <div className="d-flex mt-3">
                        <DeleteModal deleteFnName="deleteQuiz" deleteFn={deleteQuiz} delID={quiz._id} delTitle={quiz.title} />
                        <EditQuiz quizToEdit={quiz && quiz} />
                        <Link to={`/questions-create/${quiz.slug}`} className="text-secondary">
                            <img src={AddIcon} alt="" width="12" height="12" className="" /> <small>Questions</small>
                        </Link>
                    </div>
                </ToastHeader>

                <ToastBody>
                    {quiz.description}
                    <br />
                    <small className="mb-2 text-dark fw-bolder">
                        <span role="img" aria-label="pointing">🧑</span>
                        By {quiz.created_by && quiz.created_by.name}
                    </small>
                    <br />
                    <br />

                    {quiz.questions && quiz.questions.length > 0 ?
                        <>
                            <p className="fw-bolder">Questions ({quiz.questions.length})</p>

                            {quiz && quiz.questions.map((question, index) =>
                                <ul key={question._id} className="pl-1">
                                    <li style={{ listStyle: "none" }}>
                                        {index + 1}.&nbsp;
                                        <Link to={`/view-question/${question._id}`} style={{ color: fromSearch ? 'khaki' : 'blueviolet' }}>
                                            {question.questionText}
                                        </Link>
                                        <strong className="text-danger">&nbsp;({question.answerOptions.length} answers)</strong>
                                    </li>
                                </ul>
                            )}</> :
                        <p className="fw-bolder text-danger">No questions</p>}

                </ToastBody>

            </Toast>

        </Col>)
}

export default QuizToast