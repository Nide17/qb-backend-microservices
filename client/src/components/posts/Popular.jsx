import React, { useState, useEffect, lazy } from 'react'
import { Col, Row, ListGroup, ListGroupItem, Badge, Card, CardBody, CardText } from 'reactstrap'
import uploadimage from '../../images/avatar.svg'
import { getPopularToday, getUserOfMonth } from '../../redux/slices/scoresSlice'
import { useSelector, useDispatch } from 'react-redux'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import ImageWithFallback from '../../utils/ImageWithFallback'

const SquareAd = lazy(() => import('../adsenses/SquareAd'))

const Popular = () => {

    // Redux
    const dispatch = useDispatch()
    const scores = useSelector(state => state.scores)
    const { popularQuizes, monthlyUser, isLoading } = scores

    useEffect(() => {
        dispatch(getPopularToday())
        dispatch(getUserOfMonth())
    }, [dispatch])

    return (
        <>
            {/* Google square ad */}
            <Row className="d-block d-lg-none">
                <Col sm="12 w-100 d-flex justify-content-center align-items-center">
                    <div className='w-100 d-flex justify-content-center align-items-center'>
                        {process.env.NODE_ENV !== 'development' ? <SquareAd /> : null}
                    </div>
                </Col>
            </Row>

            {popularQuizes && popularQuizes.length > 0 && monthlyUser ?
                <div className="popular my-2 mt-3 mt-lg-5 py-3 d-flex flex-column flex-lg-row justify-content-between bg-white shadow-sm">

                    <div className={`w-75 mx-lg-2 ${popularQuizes && popularQuizes.length > 0 ? '' : 'd-none'}`}>
                        <h6 className="text-uppercase fancy fw-bolder mb-3 mb-lg-4 text-center"><u>Top 3 Popular Quizes Today</u></h6>

                        {!isLoading ?
                            <ListGroup>
                                {popularQuizes && popularQuizes.map((popQz, i) => (
                                    <ListGroupItem href={`/view-quiz/${popQz && popQz.slug}`} tag="a" color="success" className="d-flex justify-content-between" key={i}>
                                        <span>{i + 1}. {popQz && popQz.qTitle.toUpperCase()}</span>
                                        <Badge color="info">{popQz.count}</Badge>
                                    </ListGroupItem>
                                ))}
                            </ListGroup> :
                            <QBLoadingSM title="popular quizes today" />}
                    </div>

                    <div className="month-user px-1 w-25">
                        <h6 className="text-uppercase fancy fw-bolder mb-3 mb-lg-4 text-center"><u>User of the Month</u></h6>

                        <Card className="p-0 px-1 pt-1 monthly-user">
                            <span>
                                <ImageWithFallback
                                    src={monthlyUser && monthlyUser.uPhoto}
                                    fallbackSrc={uploadimage}
                                    alt="user of the month"
                                />
                            </span>
                            <hr className="m-0 mt-1" />
                            <CardBody className="p-1">
                                <CardText>
                                    <small className="text-muted fw-bolder">{monthlyUser && monthlyUser.uName}</small>
                                </CardText>
                            </CardBody>
                        </Card>
                    </div>
                </div> : null
            }
        </>
    )
}

export default Popular