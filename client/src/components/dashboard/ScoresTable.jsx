import React from 'react'
import { Table, Alert } from 'reactstrap'
import moment from 'moment'
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import DeleteModal from '../../utils/DeleteModal'

const ScoresTable = ({ scoresToUse, pageNo, deleteScore }) => {

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uRole = currentUser && currentUser.role

    return (
        scoresToUse && scoresToUse.length > 0 ?
            <Table bordered className='all-scores table-success' hover responsive striped size="sm">
                <thead className='text-uppercase table-dark'>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Date</th>
                        <th scope="col">Taker</th>
                        <th scope="col">Quiz</th>
                        <th scope="col">Category</th>
                        <th scope="col">Marks</th>
                        <th scope="col">Out of</th>
                        <th scope="col">Reviewing</th>
                        <th scope="col" className={`${(uRole === 'Admin' || uRole === 'SuperAdmin') ? '' : 'd-none'}`}><span role="img" aria-label="pointing">❌</span></th>
                    </tr>
                </thead>

                <tbody>

                    {scoresToUse && [...scoresToUse].sort((a, b) => new Date(b.test_date) - new Date(a.test_date)).map((score, index) => {
                        const taker = score && (uRole === 'Creator') ? score.users_scores_name : score && (uRole === 'Visitor') ? currentUser && currentUser.name : score.taken_by && score.taken_by.name

                        const qui = score && (uRole === 'Creator') ? score.quiz_scores_title : score && (uRole === 'Visitor') ? score.review && score.review.title : score.quiz && score.quiz.title

                        const catg = score && (uRole === 'Creator') ? score.category_scores_title : score.category && score.category.title

                        let date = score && new Date(score.test_date)

                        const numero = (uRole === 'Admin' || uRole === 'SuperAdmin') ? ((pageNo - 1) * 20) + index + 1 : index + 1

                        return (<tr key={index}>
                            <th scope="row" className="table-dark">{numero && numero}</th>
                            <td>{date && moment(date).format('YYYY-MM-DD, HH:mm')}</td>
                            <td className='text-uppercase'>
                                {taker && taker}
                            </td>
                            <td>{qui && qui}</td>
                            <td>{catg && catg}</td>
                            <td className={score.out_of / 2 > score.marks ? "fw-bolder text-danger" : "text-success"}>
                                {score.marks}
                            </td>
                            <td className={score.out_of / 2 > score.marks ? "fw-bolder text-danger" : "text-success"}>
                                {score.out_of}
                            </td>
                            <td>
                                <Link to={`/review-quiz/${score && score.id}`}>Review</Link>
                            </td>
                            <td className={`table-dark ${(uRole === 'Admin' || uRole === 'SuperAdmin') ? '' : 'd-none'}`}>
                                <DeleteModal deleteFnName="deleteScore" deleteFn={deleteScore} delID={score._id} delTitle={score.quiz && score.quiz.title} />
                            </td>
                        </tr>)
                    }
                    )}

                </tbody>
            </Table> :
            <Alert color="danger" className="w-50 text-center mx-auto" style={{ border: '2px solid #157A6E' }}>
                Seems like you have nothing here! Please try to take Quizes.
            </Alert>
    )
}

export default ScoresTable