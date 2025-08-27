import React from 'react'
import { Col, Row, Button } from 'reactstrap'
import PdfDocument from '../../dashboard/pdfs/PdfDocument'
import { PDFDownloadLink } from '@react-pdf/renderer';

const TitleRow = ({ thisReview, score, qnsAll, curRevQn, currentQuestion, uRole }) => {

    return (
        <Row>
            <Col>
                <div className="mb-sm-5 d-flex justify-content-around">
                    <Button outline color="success" size="sm">
                        <a href="/dashboard" className="text-dark">Dashboard</a>
                    </Button>

                    <span>
                        <p className="text-primary d-inline">Reviewing ...</p>
                        <small style={{ color: '#ffc107', fontWeight: 'bolder' }}>
                            &nbsp; Score: ~{Math.round(score * 100 / qnsAll.length)}%
                        </small>
                    </span>

                    {(uRole === 'Admin' || uRole === 'SuperAdmin') &&
                        <PDFDownloadLink document={<PdfDocument review={thisReview} />} className="mt-sm-0 share-btn mx-1 mx-md-0" fileName={`${thisReview && thisReview.title}-shared-by-Quiz-Blog.pdf`}>
                            {({ blob, url, loading, error }) => loading ? <small className="text-warning">Loading document...</small> :
                                <Button color="success"
                                    className="mt-sm-0 share-btn mx-1 mx-md-0">
                                    Download PDF
                                </Button>
                            }
                        </PDFDownloadLink>}
                </div>

                <div className='question-section my-4 mt-sm-5 mx-auto w-75'>
                    <h4 className='question-count text-uppercase text-center text-secondary fw-bolder'>
                        <span>Question <b style={{ color: "#B4654A" }}>{currentQuestion + 1}</b></span>/{qnsAll.length}
                    </h4>
                    <h5 className='q-txt my-4 fw-bolder text-center'>{curRevQn && curRevQn.questionText}</h5>

                </div>
            </Col>
        </Row>
    )
}

export default TitleRow