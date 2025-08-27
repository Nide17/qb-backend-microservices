import React, { useEffect } from 'react'
import { Row, Button, Table } from 'reactstrap'
import { getSubscribers, deleteSubscriber } from '../../redux/slices/subscribersSlice'
import { useSelector, useDispatch } from 'react-redux'
import trash from '../../images/trash.svg'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import moment from 'moment'
import DeleteModal from '../../utils/DeleteModal'

const Subscribers = () => {

    // Redux
    const subscribedUsers = useSelector(state => state.subscribers)
    const dispatch = useDispatch()

    // Lifecycle methods
    useEffect(() => {
        dispatch(getSubscribers())
    }, [dispatch])

    return (
        <div className='mx-4 my-5'>
            {
                subscribedUsers.isLoading ?
                    <QBLoadingSM title='subscribers' /> :
                    <Row>
                        <Table bordered className='all-scores table-success' hover responsive striped size="sm">
                            <thead className='text-uppercase table-dark'>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Subscription Date</th>
                                    <th scope="col"><span role="img" aria-label="pointing">❌</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribedUsers && subscribedUsers.subscribedUsers.map((subscribedUser, index) => (
                                    <tr key={subscribedUser._id}>
                                        <th scope="row" className="table-dark">{index + 1}</th>
                                        <td className='text-uppercase'>
                                            {subscribedUser.name.split(' ').slice(0, 2).join(' ')}
                                        </td>
                                        <td className='text-lowercase'>{subscribedUser.email}</td>
                                        <td>
                                            <i>
                                                {moment(new Date(subscribedUser.createdAt))
                                                    .format('YYYY-MM-DD, HH:mm')}
                                            </i>
                                        </td>
                                        <td className="table-dark">
                                            <DeleteModal deleteFnName="deleteSubscriber" deleteFn={deleteSubscriber} delID={subscribedUser._id} delTitle={subscribedUser.name} />
                                        </td>
                                    </tr>))}
                            </tbody>
                        </Table>
                    </Row>
            }
        </div>
    )
}

export default Subscribers