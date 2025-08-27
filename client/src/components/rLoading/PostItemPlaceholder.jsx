import React from 'react'
import { Card } from 'reactstrap';
import './PostItemPlaceholder.css'

const PostItemPlaceholder = () => {

    return (
        <Card body className="bg-light py-3 px-1 px-sm-3 my-2 my-sm-3 border">
            <div className="skeleton-container">
                <div className="skeleton-box"></div>
                <div className="skeleton-box"></div>
                <div className="skeleton-box"></div>
            </div>
        </Card>
    )
}
export default PostItemPlaceholder