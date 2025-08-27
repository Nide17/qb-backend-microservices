import React from 'react'
import { Table, Alert } from 'reactstrap'
import { Link } from "react-router-dom"
import moment from 'moment'
import { deleteBlogPost } from '../../../redux/slices'
import DeleteModal from '../../../utils/DeleteModal'
import { useSelector } from "react-redux"

const BPTable = ({ bpostsToUse }) => {

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uRole = currentUser && currentUser.role

    return (
        <>
            {bpostsToUse && bpostsToUse.length > 0 ?

                <Table bordered className='all-scores table-success' hover responsive striped size="sm">
                    <thead className='text-uppercase table-dark'>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">TITLE</th>
                            <th scope="col">CATEGORY</th>
                            <th scope="col">CREATOR</th>
                            <th scope="col">DATE</th>
                            <th scope="col" className={`${(uRole === 'Admin' || uRole === 'SuperAdmin') ? '' : 'd-none'}`}>EDIT</th>
                            <th scope="col" className={`${(uRole === 'Admin' || uRole === 'SuperAdmin') ? '' : 'd-none'}`}><span role="img" aria-label="pointing">❌</span></th>
                        </tr>
                    </thead>

                    <tbody>

                        {bpostsToUse && bpostsToUse.map((bPost, index) => {

                            const numero = index + 1
                            const bPTitle = bPost && bPost.title
                            const catg = bPost && bPost.postCategory && bPost.postCategory.title
                            const creator = bPost && bPost.creator && bPost.creator.name
                            const creat = bPost && bPost.creator
                            let date = bPost && new Date(bPost.createdAt)

                            return (<tr key={index}>
                                <th scope="row" className="table-dark">{numero && numero}</th>
                                <td className='text-uppercase'>{bPTitle && bPTitle}</td>
                                <td>{catg && catg}</td>
                                <td>{creator && creator}</td>
                                <td>{date && moment(date).format('YYYY-MM-DD, HH:mm')}</td>
                                <td className={`${((uRole === 'Admin' || uRole === 'SuperAdmin') || creat._id === currentUser._id) ? '' : 'd-none'}`}>
                                    <Link to={`/edit-bpost/${bPost.slug}`}>Edit</Link>
                                </td>
                                <td className={`${((uRole === 'Admin' || uRole === 'SuperAdmin') || creat._id === currentUser._id) ? '' : 'd-none'}`}>
                                    <DeleteModal deleteFnName="deleteBlogPost" deleteFn={deleteBlogPost} delID={bPost._id} delTitle={bPost.title} />
                                </td>
                            </tr>)
                        })}

                    </tbody>
                </Table> :

                <Alert color="danger" className="w-50 text-center mx-auto" style={{ border: '2px solid #157A6E' }}>
                    Seems like you have nothing here!
                </Alert>}
        </>
    )
}

export default BPTable