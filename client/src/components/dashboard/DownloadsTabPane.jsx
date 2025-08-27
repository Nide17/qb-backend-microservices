import React, { useState, useEffect } from 'react'
import { Row, TabPane } from 'reactstrap';
import { getDownloads, getCreatorDownloads, getUserDownloads } from '../../redux/slices/downloadsSlice'
import { useSelector, useDispatch } from 'react-redux'
import Pagination from './Pagination';
import PageOf from './PageOf';
import DownloadsTable from './DownloadsTable';
import QBLoadingSM from '../rLoading/QBLoadingSM';

const DownloadsTabPane = () => {

    // Redux
    const dispatch = useDispatch()
    const downloads = useSelector(state => state.downloads)
    const { isLoading, totalPages, allDownloads, userDownloads, creatorDownloads } = downloads

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uId = currentUser && currentUser._id
    const uRole = currentUser && currentUser.role
    const downloadsToUse = downloads && (uRole === 'Admin' || uRole === 'SuperAdmin') ? allDownloads :
        downloads && (uRole === 'Creator') ? creatorDownloads : userDownloads

    const [pageNo, setPageNo] = useState(1);
    const [numberOfPages, setNumberOfPages] = useState(0)

    // Lifecycle methods
    useEffect(() => {
        if (uRole === 'Admin' || uRole === 'SuperAdmin') {
            dispatch(getDownloads(pageNo))
            setNumberOfPages(totalPages && totalPages)
        }
        else if (uRole === 'Creator') {
            dispatch(getCreatorDownloads(uId, pageNo))
        }
        else {
            dispatch(getUserDownloads(uId, pageNo))
        }
    }, [dispatch, pageNo, uId, uRole, totalPages])

    return (
        <TabPane tabId="5">

            {isLoading ?
                <QBLoadingSM title='downloads' /> :

                <Row>
                    {(uRole === 'Admin' || uRole === 'SuperAdmin') ?
                        <PageOf pageNo={pageNo} numberOfPages={numberOfPages} /> : null}

                    <DownloadsTable
                        downloadsToUse={downloadsToUse}
                        pageNo={pageNo} />

                    {uRole !== 'Visitor' ?
                        <>
                            <Pagination pageNo={pageNo} setPageNo={setPageNo} numberOfPages={numberOfPages} />
                        </> : null}
                </Row>
            }

        </TabPane>
    )
}

export default DownloadsTabPane