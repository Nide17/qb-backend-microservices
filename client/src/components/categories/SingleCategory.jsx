import React from 'react'
import { Row, Col, Toast, ToastBody, ToastHeader, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import { Link, useParams } from 'react-router-dom'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { useSelector } from 'react-redux'

const SingleCategory = () => {
    const categories = useSelector(state => state.categories)
    const { categoryId } = useParams()

    const renderCategory = (category) => (
        <div className="my-2 mt-lg-5 mx-3 mx-lg-5 single-category" key={category._id}>
            <Row key={category._id} className="mb-0 mb-lg-3 mx-0 justify-content-center text-capitalize">
                <Breadcrumb>
                    <BreadcrumbItem style={{ color: "#157A6E" }}>
                        <Link to="/dashboard">{category.title}</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>Quizes</BreadcrumbItem>
                </Breadcrumb>
            </Row>
            <small className="ms-2 one-cat-desc d-flex justify-content-center">
                <i className="text-success text-start text-capitalize">
                    "{category.description}"
                </i>
            </small>
            <Row className="mx-0 mx-lg-5 mt-2 m-lg-4 d-flex justify-content-between align-items-center text-primary">
                <Col sm="12" key={category._id} className="mt-3 categories-toast" id={category.title.split(' ').join('-').replace(/[^a-zA-Z0-9]/g, '-') + category._id}>
                    <Toast className="px-lg-5">
                        <ToastHeader className="text-success overflow-auto">
                            <strong>
                                <a href={`/all-categories/#${category.title.split(' ').join('-').replace(/[^a-zA-Z0-9]/g, '-') + category._id}`} className="text-success text-uppercase">
                                    {category.title}
                                </a>
                            </strong>&nbsp;
                            (<small className="mb-0 text-dark">
                                This category contains <span className="fw-bolder">{category.quizes.length}</span> quiz(zes)</small>)
                        </ToastHeader>
                        <ToastBody>
                            <p className="fw-bolder mt-2">Quizzes ({category.quizes.length})</p>
                            <ul className="pl-1">
                                {category && category.quizes.map((quiz, index) =>
                                    <li key={quiz._id} style={{ listStyle: "none", marginBottom: ".3rem" }}>
                                        {index + 1}.&nbsp;
                                        <Link to={`/view-quiz/${quiz.slug}`}>
                                            {quiz.title}
                                        </Link>
                                        <strong className="text-warning">&nbsp;
                                            ({quiz.questions.length} questions)</strong>
                                    </li>
                                )}
                            </ul>
                        </ToastBody>
                    </Toast>
                </Col>
            </Row>
        </div>
    )

    return (
        !categories.isLoading ?
            <>
                {categories.allcategories && categories.allcategories.map(category => (
                    category._id === categoryId ? renderCategory(category) : null
                ))}
            </> :
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                <QBLoadingSM title="category" />
            </div>
    )
}

export default SingleCategory