import React, { useEffect, useContext } from 'react'

import Dashboard from '../dashboard/Dashboard'
import { Link, useParams } from 'react-router-dom'
import { Row, Col, Table, Breadcrumb, BreadcrumbItem, Button } from 'reactstrap'
import { setRankingScores } from '../../redux/slices/scoresSlice'
import { useSelector, useDispatch } from 'react-redux'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import AddVideo from './AddVideo'
import ViewQuizComments from './ViewQuizComments'
import { logRegContext } from '../../appContexts'

const QuizRanking = () => {

    // Redux
    const dispatch = useDispatch()
    const scores = useSelector(state => state.scores)
    const currentUser = useSelector(state => state.auth?.user)
    const isAuthenticated = useSelector(state => state.auth?.isAuthenticated)
    const auth = useSelector(state => state.auth)
    const { toggleL } = useContext(logRegContext)

    const { quizID } = useParams()

    useEffect(() => {
        dispatch(setRankingScores(quizID))
    }, [dispatch, quizID])

    const rankings = scores?.rankingScores
    const cTitle = rankings?.[0]?.category?.title
    const qTitle = rankings?.[0]?.quiz?.title

    const renderTableRows = () => {
        let i = 1
        return rankings?.map(rank => (
            rank?.quiz?._id === quizID ? (
                <tr key={rank._id}>
                    <th scope="row">{i++}</th>
                    <td>{rank.taken_by?.name || 'No name'}</td>
                    <td>{rank.taken_by?.email || 'No mail'}</td>
                    <td>{rank.marks}/{rank.out_of}</td>
                </tr>
            ) : null
        ))
    }

    return (

        isAuthenticated ?

            currentUser?.role !== 'Visitor' ?
                <>
                    <div className="mt-5 mx-5 single-category">
                        <Row className="mb-0 mb-lg-3 mx-0 d-flex justify-content-around align-items-center">
                            <Breadcrumb>
                                <BreadcrumbItem>
                                    <Link to="/dashboard">{cTitle}</Link>
                                </BreadcrumbItem>
                                <BreadcrumbItem active>{qTitle} - Comments & Ranking</BreadcrumbItem>
                            </Breadcrumb>

                            {(currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin') && <AddVideo quizID={quizID} />}

                        </Row>
                    </div>
                    <Row className="mx-2 mx-lg-5">

                        <Col sm="6" style={{ height: "95%" }} className="my-2 overflow-auto">
                            <ViewQuizComments quizID={quizID} />
                        </Col>

                        <Col sm="6" style={{ height: "95%" }} className="my-2 overflow-auto">

                            {scores.isLoading ?
                                <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
                                    <QBLoadingSM />
                                </div> :

                                (currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin') ?

                                    <Table hover responsive>

                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Marks</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {renderTableRows()}
                                        </tbody>
                                    </Table> :
                                    <p className="d-block text-danger text-uppercase fw-bolder vh-100">
                                        You are not allowed to view this ...
                                    </p>
                            }</Col>

                    </Row>
                </> :
                <Dashboard /> :

            // If not authenticated or loading
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {
                    auth.isLoading ?
                        <QBLoadingSM /> :
                        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                            Login first
                        </Button>
                }
            </div>
    )
}

export default QuizRanking