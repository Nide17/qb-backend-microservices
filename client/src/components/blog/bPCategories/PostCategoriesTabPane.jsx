import React, { useEffect } from 'react'
import { Row, Col, Card, Button, CardTitle, CardText, TabPane } from 'reactstrap'
import { getPostCategories, deletePostCategory } from '../../../redux/slices/postCategoriesSlice'
import { useSelector, useDispatch } from "react-redux"
import { Link } from 'react-router-dom'
import EditBPCategory from './EditBPCategory'
import CreateBPCategory from './CreateBPCategory'
import QBLoadingSM from '../../rLoading/QBLoadingSM'
import DeleteModal from '../../../utils/DeleteModal'

const PostCategoriesTabPane = () => {

  const dispatch = useDispatch()
  const bPcats = useSelector(state => state.postCategories)
  const { isLoading, allPostCategories } = bPcats

  const auth = useSelector(state => state.auth)
  const currentUser = auth && auth.user

  useEffect(() => { dispatch(getPostCategories()) }, [dispatch])

  return (
    <TabPane tabId="6">

      <Button size="sm" outline color="info" className="mx-3 mb-2 p-2 btn btn-warning">
        <CreateBPCategory />
      </Button>

      {isLoading ?
        <QBLoadingSM title='Blog post categories' /> :

        <Row>
          {allPostCategories && allPostCategories.map(category => (

            <Col sm="6" className="mt-2" key={category._id}>
              <Card body>

                <CardTitle className="text-uppercase">
                  <strong>{category.title} Blog Posts</strong>
                </CardTitle>

                <CardText><small>{category.description}</small></CardText>

                <div className="actions d-flex ms-3">

                  <Button size="sm" outline color="info" className="mx-2">
                    <Link to={`/create-bpost/${category && category._id}`}>Add Blog Post</Link>
                  </Button>

                  {
                    currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin' ?
                      <>
                        <Button size="sm" color="link" className="mx-2">
                          <EditBPCategory
                            categoryToEdit={category} />
                        </Button>
                        <DeleteModal deleteFnName="deletePostCategory" deleteFn={deletePostCategory} delID={category._id} delTitle={category.title} />
                      </>
                      : null
                  }

                </div>

              </Card>
            </Col>
          ))}
        </Row>
      }

    </TabPane>
  )
}

export default PostCategoriesTabPane