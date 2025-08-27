import React from 'react'
import { Row, Col, Card, Button, CardTitle, CardText, TabPane } from 'reactstrap'
import { useSelector } from "react-redux"
import { deleteCategory } from '../../redux/slices/categoriesSlice'
import { Link } from "react-router-dom"
import AddQuiz from '../quizes/AddQuiz'
import EditCategory from './EditCategory'
import CreateCategory from '../categories/CreateCategory'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import DeleteModal from '../../utils/DeleteModal'

const CategoriesTabPane = () => {

    const categories = useSelector(state => state.categories)
    const courseCategories = useSelector(state => state.courseCategories)
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user

    const renderCategory = (category) => (
        <Col sm="6" className="mt-2" key={category._id}>
            <Card body>
                <CardTitle>
                    <Link to={`/category/${category._id}`} className="text-success text-uppercase fw-bolder">
                        {category.title} Quizes ({category.quizes.length})
                    </Link>
                </CardTitle>
                <CardText>{category.description}</CardText>
                <div className="actions ms-3">
                    <Button size="sm" outline className="mx-2" style={{ color: '#157A6E', backgroundColor: '#ffc107' }}>
                        <AddQuiz category={category} />
                    </Button>
                    {
                        (currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin') && (
                            <>
                                <Button size="sm" color="link" className="mx-2">
                                    <EditCategory
                                        categoryToEdit={category}
                                        courseCategories={courseCategories && courseCategories.allCourseCategories} />
                                </Button>
                                <Button size="sm" color="link" className="mx-2">
                                    <DeleteModal
                                        deleteFnName="deleteCategory"
                                        deleteFn={deleteCategory}
                                        delTitle={category.title}
                                        delID={category._id} />
                                </Button>
                                <small style={{ color: '#157A6E' }} className="ms-sm-5 text-center text-uppercase">
                                    <u>{category.courseCategory && category.courseCategory.title}</u>
                                </small>
                            </>
                        )
                    }
                </div>
            </Card>
        </Col>
    )

    return (
        <TabPane tabId="1">
            <Button size="sm" outline color="info" className="mx-3 mb-2 p-2 btn btn-warning">
                <CreateCategory courseCategories={courseCategories && courseCategories.allCourseCategories} />
            </Button>
            {categories.isLoading ? (
                <QBLoadingSM title='categories' />
            ) : (
                <Row>
                    {categories.allcategories && categories.allcategories.map(renderCategory)}
                </Row>
            )}
        </TabPane>
    )
}

export default CategoriesTabPane