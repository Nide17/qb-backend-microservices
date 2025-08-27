import React, { useEffect } from 'react'
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap'
import { Link } from "react-router-dom"
import { getNotesByCCatg } from '../../../redux/slices/notesSlice'
import { useSelector, useDispatch } from 'react-redux'
import Unavailable from './Unavailable'
import QBLoadingSM from '../../rLoading/QBLoadingSM'

const RelatedNotes = ({ ccatgID }) => {

  const dispatch = useDispatch()
  const notesCCatg = useSelector(state => state.notes)

  useEffect(() => {
    dispatch(getNotesByCCatg(ccatgID))
  }, [dispatch, ccatgID])

  const thisCatNotes = notesCCatg && notesCCatg.notesByCCatg

  return (
    !notesCCatg.isByCCatgLoading ? (
      thisCatNotes && thisCatNotes.length > 0 ? (
        <Row className="similar-quizes mx-sm-3 w-100">
          <h4 className="text-center col-12 mb-4 fw-bolder text-uppercase text-underline">
            Notes and resources that may interest you</h4>
          {thisCatNotes &&
            Array.from(thisCatNotes)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
              .map(notes => (
                <Col sm="4" key={notes._id} className="my-1 my-sm-4">
                  <Card body>
                    <CardTitle tag="h5" className="text-uppercase">{notes.title}</CardTitle>
                    <CardText>{notes.description}</CardText>
                    <Button color="success">
                      <Link to={`/view-note-paper/${notes.slug}`} className="text-white">
                        Download
                      </Link>
                    </Button>
                  </Card>
                </Col>
              ))}
        </Row>
      ) : (
        <Unavailable title='No related notes available yet' link='/course-notes' more='notes' />
      )
    ) : (
      <QBLoadingSM title='notes' />
    )
  )
}

export default RelatedNotes
