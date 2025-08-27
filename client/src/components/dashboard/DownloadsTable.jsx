import React from 'react'
import moment from 'moment'
import { Table, Alert } from 'reactstrap'
import { deleteDownload } from '../../redux/slices/downloadsSlice'
import DeleteModal from '../../utils/DeleteModal'
import { useSelector } from "react-redux"

const DownloadsTable = ({ downloadsToUse, pageNo }) => {

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uRole = currentUser && currentUser.role

    return (
        downloadsToUse && downloadsToUse.length > 0 ?
            <Table bordered className='all-scores table-success' hover responsive striped size="sm">
                <thead className='text-uppercase table-dark'>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Date</th>
                        <th scope="col">User</th>
                        <th scope="col">File</th>
                        <th scope="col">Chapter</th>
                        <th scope="col">Course</th>
                        <th scope="col" className={`${(uRole === 'Admin' || uRole === 'SuperAdmin') ? '' : 'd-none'}`}><span role="img" aria-label="pointing">❌</span></th>
                    </tr>
                </thead>

                <tbody>
                    {downloadsToUse && [...downloadsToUse].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((download, index) => {

                        const user = download && (uRole === 'Creator') ? download.users_downloads_name : download && (uRole === 'Visitor') ? currentUser && currentUser.name : download.downloaded_by && download.downloaded_by.name

                        const note = download && (uRole === 'Creator') ? download.notes_downloads_title : download.notes && download.notes.title

                        const chap = download && (uRole === 'Creator') ? download.chapters_downloads_title : download.chapter && download.chapter.title

                        const cours = download && (uRole === 'Creator') ? download.courses_downloads_title : download.course && download.course.title

                        const dat = download && (uRole === 'Creator') ? new Date(download.updatedAt) : new Date(download.createdAt)

                        const numero = (uRole === 'Admin' || uRole === 'SuperAdmin') ? ((pageNo - 1) * 20) + index + 1 : index + 1

                        return (
                            <tr key={index}>
                                <th scope="row" className="table-dark">{numero && numero}</th>
                                <td>{dat && moment(dat).format('YYYY-MM-DD, HH:mm')}</td>
                                <td className='text-uppercase'>{user && user}</td>
                                <td>{note && note}</td>
                                <td>{chap && chap}</td>
                                <td>{cours && cours}</td>
                                <td className={`table-dark ${(uRole === 'Admin' || uRole === 'SuperAdmin') ? '' : 'd-none'}`}>
                                    <DeleteModal deleteFnName="deleteDownload" deleteFn={deleteDownload} delID={download._id} delTitle={download.notes && download.notes.title} />
                                </td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </Table> :
            <Alert color="danger" className="w-50 text-center mx-auto" style={{ border: '2px solid #157A6E' }}>
                Seems like you have nothing here! Feel free to download study materials.
            </Alert>
    )
}

export default DownloadsTable