import React from 'react'
import { Card, CardTitle, CardText } from 'reactstrap'
import { Link } from "react-router-dom"
import moment from 'moment'

const NotesPapersItem = ({ note, fromSearch }) => {

    const { slug, title, description, courseCategory, course, chapter, createdAt } = note

    return (
        <Card body className={fromSearch ? 'bg-info text-white py-3 px-1 px-lg-3 my-2 my-lg-3 mx-0 mx-sm-5' : 'bg-secondary py-3 px-1 px-lg-3 my-2 my-lg-3 mx-0 mx-sm-5'}>

            <CardTitle tag="h5" className={`mb-0 ${fromSearch ? 'text-white' : 'text-primary'} text-uppercase`}>
                <Link to={`/view-note-paper/${slug}`}>{title && title}
                </Link>
            </CardTitle>

            <div className="small-text d-flex justify">
                <p className="me-2 me-md-5 my-1 text-dark">
                    {moment(new Date(createdAt)).format('DD MMM YYYY, HH:mm')}
                </p>
                <p className="me-2 me-md-5 my-1 text-dark">{courseCategory && courseCategory.title}</p>
                <p className="me-2 me-md-5 my-1 text-dark">- {course && course.title}
                    <small>&nbsp;({chapter && chapter.title})</small>
                </p>
            </div>

            <CardText className="mt-1 details text-secondary text-capitalize">{description && description}</CardText>
        </Card>
    )
}

export default NotesPapersItem