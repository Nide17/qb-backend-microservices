import React from 'react'
import { Card, CardBody, CardTitle } from 'reactstrap'
import { Link } from "react-router-dom"
import moment from 'moment'
import altImage from '../../../images/dashboard.svg'

const BlogPostItem = ({ blogPost }) => {

    const { slug, title, postCategory, post_image, brand, creator, createdAt } = blogPost

    return (
        <Card
            className={`bg-light py-3 px-1 px-sm-3 my-2 my-sm-3 border`}>
            <Link to={`/view-blog-post/${slug}`}>
                <CardBody>
                    <CardTitle tag="h5"
                        className={`mb-3 text-primary text-uppercase fw-bolder`}>
                        {title && title}
                    </CardTitle>
                </CardBody>

                <div className="PostImage">
                    <img src={post_image || altImage} alt={brand} />
                </div>
            </Link>

            <CardBody>
                <div className="small-text d-flex flex-column flex-sm-row justify-content-center">
                    <p className="me-2 me-md-5 my-1 text-dark">
                        {moment(new Date(createdAt)).format('DD MMM YYYY, HH:mm')}
                    </p>
                    <p className="me-2 me-md-5 my-1 text-dark">{postCategory && postCategory.title}
                        <small>&nbsp;({creator && creator.name})</small>
                    </p>
                </div>
            </CardBody>
        </Card>
    )
}

export default BlogPostItem