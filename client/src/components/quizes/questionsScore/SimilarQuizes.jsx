import React from 'react'
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap'
import { Link } from "react-router-dom"
import Unavailable from './Unavailable'

const SimilarQuizes = ({ thisQId, categories, categoryId }) => {

    const thisCat = categories && categories.find(c => c._id === categoryId)
    const thisCatQzs = thisCat && thisCat.quizes

    return (
        thisCatQzs && thisCatQzs.filter(q => q._id !== thisQId).length > 0 ?
            <>
                {
                    <Row className="similar-quizes mx-sm-3 w-100">
                        <h4 className="text-center col-12 mb-4 ms-1 fw-bolder text-uppercase text-underline">
                            Other quizzes that might interest you
                        </h4>
                        {
                            thisCatQzs && thisCatQzs &&
                            Array.from(thisCatQzs)
                                .filter(q => q._id !== thisQId)
                                .sort(() => 0.5 - Math.random())
                                .map(quiz => (
                                    <Col sm="4" key={quiz._id} className="my-1 my-sm-4">
                                        <Card body>
                                            <CardTitle tag="h5" className="text-uppercase">
                                                {quiz.title} ({quiz.questions.length})
                                            </CardTitle>
                                            <CardText>{quiz.description}</CardText>
                                            <Button color="info">
                                                <Link to={`/view-quiz/${quiz.slug}`} className="text-white">
                                                    Attempt
                                                </Link>
                                            </Button>
                                        </Card>
                                    </Col>
                                )).slice(0, 3)}
                    </Row>
                }
            </> :
            <Unavailable title='No related quizes available yet' link='/allposts' more='quizes' />
    )
}

export default SimilarQuizes