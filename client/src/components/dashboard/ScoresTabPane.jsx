import React, { useState, useEffect } from 'react'
import { Row, TabPane } from 'reactstrap'
import Pagination from './Pagination'
import PageOf from './PageOf'
import ScoresTable from './ScoresTable'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { setScores, getCreatorScores, getTakerScores, deleteScore } from '../../redux/slices/scoresSlice'
import { useSelector, useDispatch } from 'react-redux'

const ScoresTabPane = () => {

    // Redux
    const dispatch = useDispatch()
    const scores = useSelector(state => state.scores)
    const { isLoading, totalPages, allScores, creatorScores, takerScores } = scores

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uId = currentUser && currentUser._id
    const uRole = currentUser && currentUser.role
    const scoresToUse = scores && (uRole === 'Admin' || uRole === 'SuperAdmin') ? allScores :
        scores && (uRole === 'Creator') ? creatorScores : takerScores

    const [pageNo, setPageNo] = useState(1)

    // Lifecycle methods
    useEffect(() => {
        if (uRole === 'Admin' || uRole === 'SuperAdmin') {
            dispatch(setScores(pageNo))
        }
        else if (uRole === 'Creator') {
            dispatch(getCreatorScores(uId, pageNo))
        }
        else {
            dispatch(getTakerScores(uId, pageNo))
        }
    }, [dispatch, pageNo, uId, uRole, totalPages])

    return (

        <TabPane tabId="4">
            {
                isLoading ?
                    <QBLoadingSM title='scores' /> :

                    <Row>
                        {(uRole === 'Admin' || uRole === 'SuperAdmin') ?
                            <PageOf pageNo={pageNo} numberOfPages={totalPages} /> : null}

                        <ScoresTable
                            scoresToUse={scoresToUse}
                            deleteScore={deleteScore}
                            pageNo={pageNo} />

                        {uRole !== 'Visitor' ?
                            <>
                                <Pagination pageNo={pageNo} setPageNo={setPageNo} numberOfPages={totalPages} />
                            </> : null}
                    </Row>}
        </TabPane>
    )
}

export default ScoresTabPane