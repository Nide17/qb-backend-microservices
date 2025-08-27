import React, { useEffect } from 'react'
import { Row, TabPane, Table } from 'reactstrap';
import { getSubscribers, deleteSubscriber } from '../../redux/slices/subscribersSlice'
import { useSelector, useDispatch } from 'react-redux';
import QBLoadingSM from '../rLoading/QBLoadingSM';
import moment from 'moment'
import DeleteModal from '../../utils/DeleteModal';

const SubscribersTabPane = () => {

    // Redux
    const dispatch = useDispatch()
    const subscribedUsers = useSelector(state => state.subscribers)

    // Lifecycle methods
    useEffect(() => { dispatch(getSubscribers()) }, [dispatch])

    return (
        <TabPane tabId="6" className='mx-4'>
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
                                    <th scope="col">❌</th>
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
                                            {moment(new Date(subscribedUser.createdAt))
                                                .format('YYYY-MM-DD, HH:mm')}
                                        </td>
                                        <td className="table-dark">
                                            <DeleteModal deleteFnName="deleteSubscriber" deleteFn={deleteSubscriber} delID={subscribedUser._id} delTitle={subscribedUser.name} />
                                        </td>
                                    </tr>))}
                            </tbody>
                        </Table>
                    </Row>
            }

        </TabPane>
    )
}

export default SubscribersTabPane