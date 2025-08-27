import React, { useEffect, useState, lazy, Suspense } from 'react'
import { Row, Col, Button } from 'reactstrap'
import { Collapse } from "react-collapse"
import classNames from "classnames"
import faqsStyle from '../../stylesCSS/faqsStyle.module.css'
import AddIcon from '../../images/plus1.svg'
import MinusIcon from '../../images/minus.svg'
import { getFaqs, deleteFaq } from '../../redux/slices/faqsSlice'
import { useSelector, useDispatch } from 'react-redux'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import CreateFaq from './CreateFaq'
import EditFaq from './EditFaq'
import AddVideo from '../quizes/AddVideo'
import EmbeddedVideos from '../quizes/EmbeddedVideos'
import DeleteModal from '../../utils/DeleteModal'

const GridMultiplex = lazy(() => import('../adsenses/GridMultiplex'))
const InFeedAd = lazy(() => import('../adsenses/InFeedAd'))

const FaqCollapse = () => {

    // Redux
    const dispatch = useDispatch()
    const faqs = useSelector(state => state.faqs)
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const faqsToUse = faqs && faqs.allFaqs

    // Lifecycle methods
    useEffect(() => {
        dispatch(getFaqs())
    }, [dispatch])

    const [state, setState] = useState({
        activeIndex: null
    })

    const toggleClass = (index, e) => {
        setState({ activeIndex: state.activeIndex === index ? null : index })
    }

    const moreLess = (index) => {
        if (state.activeIndex === index) {
            return (
                <span>
                    <img src={MinusIcon} alt='collapse' width={20} height={20} />
                </span>
            )
        } else {
            return (
                <span>
                    <img src={AddIcon} alt='expand' width={20} height={20} />
                </span>
            )
        }
    }

    const { activeIndex } = state

    return (
        faqs.isLoading ?
            <QBLoadingSM title='faqs' /> :

            <div className='py-0 px-3 py-lg-5 w-100'>
                <div className="jbtron rounded px-3 px-sm-4 py-3 py-sm-5 p-2 py-lg-4 my-3 my-sm-4 text-center border border-info">
                    <h1 className="display-5 fw-bolder text-white">
                        Frequently Asked Questions
                    </h1>
                    <p className="lead mb-1 text-white">
                        Quiz-Blog is a web application that provides a multi-category space for people to quiz from.
                    </p>

                    <p className="text-white">
                        It gives people good time to fix what they studied and even prepare for exams.
                    </p>

                    <small className='fw-bolder text-white'>Reach us on <a href="mailto:quizblog.rw@gmail.com?subject=Contact%20Quiz%20Blog" style={{ color: "#ffc107" }}><u>quizblog.rw@gmail.com</u></a> for further details.</small>
                    <hr className="my-2" style={{ height: "2px", borderWidth: 0, color: "#157A6E", backgroundColor: "#157A6E" }} />
                </div>

                {(currentUser && currentUser.role) === 'Admin' || (currentUser && currentUser.role) === 'SuperAdmin' ?
                    <Row className="m-lg-4 px-lg-5 d-flex justify-content-around align-items-center text-primary">
                        <CreateFaq />
                    </Row> :

                    <Suspense fallback={<QBLoadingSM />}>
                        {process.env.NODE_ENV !== 'development' ? <InFeedAd /> : null}
                    </Suspense>
                }

                <Row className="m-lg-4 px-lg-5 d-flex justify-content-around align-items-center text-primary">

                    <ul className={faqsStyle.docsList}>

                        {faqsToUse && faqsToUse.map((faq, index) => {

                            return (
                                <li key={index}>

                                    <div className={faqsStyle.titleToggler}>
                                        <h3>
                                            {faq.title}
                                        </h3>

                                        <span>
                                            <Button
                                                className="btn btn-warning btn-xs"
                                                onClick={() => toggleClass(index)}
                                            >
                                                {moreLess(index)}
                                            </Button>

                                            {
                                                (currentUser && currentUser.role) === 'Admin' || (currentUser && currentUser.role) === 'SuperAdmin' ?
                                                    <>
                                                        <Button size="sm" color="link" className="mx-2">
                                                            <EditFaq faqToEdit={faq} />
                                                        </Button>
                                                        <DeleteModal deleteFnName="deleteFaq" deleteFn={deleteFaq} delID={faq._id} delTitle={faq.title} />
                                                        <AddVideo faqID={faq._id} isFromFaqs={true} />
                                                    </>
                                                    : null
                                            }
                                        </span>
                                    </div>

                                    <Collapse isOpened={activeIndex === index}>
                                        <div
                                            className={classNames("alert alert-secondary msg", {
                                                show: activeIndex === index,
                                                hide: activeIndex !== index
                                            })}
                                        >
                                            <div className={faqsStyle.collapseContent}>
                                                <div className={faqsStyle.docsLinks}>
                                                    <p>{faq.answer}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <EmbeddedVideos faq={faq} isFromFaqs={true} />
                                    </Collapse>
                                </li>
                            )
                        })
                        }
                    </ul>

                    <Col sm="12">
                        <Suspense fallback={<QBLoadingSM />}>
                            {process.env.NODE_ENV !== 'development' ? <GridMultiplex /> : null}
                        </Suspense>
                    </Col>
                </Row>
            </div>

    )
}

export default FaqCollapse