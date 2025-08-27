import React from 'react'
import { Table, Alert } from 'reactstrap'
import moment from 'moment'
import { useSelector } from "react-redux"

const FeedbacksTable = ({ feedbacksToUse, pageNo }) => {

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uRole = currentUser && currentUser.role

    return (
        feedbacksToUse && feedbacksToUse.length > 0 ?
            <Table bordered className='all-scores table-success' hover responsive striped size="sm">
                <thead className='text-uppercase table-dark'>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Date</th>
                        <th scope="col">Taker</th>
                        <th scope="col">Quiz</th>
                        <th scope="col">Marks</th>
                        <th scope="col">Out of</th>
                        <th scope="col">Rate/10</th>
                        <th scope="col">Comment</th>
                    </tr>
                </thead>

                <tbody>
                    {feedbacksToUse && [...feedbacksToUse].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((feedback, index) => {
                        let date = feedback && new Date(feedback.createdAt)
                        const numero = (uRole === 'Admin' || uRole === 'SuperAdmin') ? ((pageNo - 1) * 20) + index + 1 : index + 1
                        const scoreF = feedback && feedback.score
                        const quiz = feedback && feedback.quiz
                        const rating = feedback && feedback.rating
                        const comment = feedback && feedback.comment

                        return (<tr key={index}>
                            <th scope="row" className="table-dark">{numero && numero}</th>
                            <td>{date && moment(date).format('YYYY-MM-DD, HH:mm')}</td>
                            <td className='text-uppercase'>
                                {scoreF && scoreF.taken_by && scoreF.taken_by.name}
                            </td>
                            <td>{quiz && quiz.title}</td>
                            <td>{scoreF && scoreF.marks && scoreF.marks}</td>
                            <td>{scoreF && scoreF.out_of && scoreF.out_of}</td>
                            <td>{rating && rating}</td>
                            <td>{comment && comment}</td>
                        </tr>)
                    })}

                </tbody>
            </Table> :
            <Alert color="danger" className="w-50 text-center mx-auto" style={{ border: '2px solid #157A6E' }}>
                Seems like you have nothing here!
            </Alert>
    )
}

export default FeedbacksTable