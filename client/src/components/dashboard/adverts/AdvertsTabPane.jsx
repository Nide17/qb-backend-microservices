import React, { useEffect } from 'react'
import { Row, Col, Button, TabPane, Alert } from 'reactstrap'
import CreateAdvert from './CreateAdvert'
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import { getAdverts } from '../../../redux/slices/advertsSlice'
import { useSelector, useDispatch } from "react-redux"
import AdvertCard from './AdvertCard'

const AdvertsTabPane = () => {

    // Redux
    const dispatch = useDispatch()
    const adverts = useSelector(state => state.adverts)
    const { isLoading, allAdverts } = adverts
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uRole = currentUser && currentUser.role

    // Lifecycle method
    useEffect(() => { dispatch(getAdverts()) }, [dispatch])

    return (
        <TabPane tabId="10">

            <Button size="sm" outline color="info" className="m-3 mb-2 p-2 btn btn-warning">
                <CreateAdvert />
            </Button>

            {isLoading ?

                <QBLoadingSM title='adverts' /> :

                allAdverts && allAdverts.length < 1 ?
                    <Alert color="danger" className="w-50 text-center mx-auto" style={{ border: '2px solid #157A6E' }}>
                        No adverts created yet!
                    </Alert> :

                    <Row>
                        {allAdverts && allAdverts.map(advert => (

                            <Col sm="6" className="mt-2" key={advert._id}>
                                <AdvertCard advert={advert} uRole={uRole} dispatch={dispatch} />
                            </Col>
                        ))}
                    </Row>
            }
        </TabPane>
    )
}

export default AdvertsTabPane