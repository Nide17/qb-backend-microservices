import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button, Row, Col, Form, FormGroup, Label, Input, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import Dashboard from '../dashboard/Dashboard'
import { getOneQuestion, updateQuestion } from '../../redux/slices/questionsSlice'
import { useSelector, useDispatch } from 'react-redux'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { logRegContext } from '../../appContexts'
import { notify } from '@/utils/notifyToast'

const EditQuestion = () => {

    // Redux
    const dispatch = useDispatch()
    const quest = useSelector(state => state.questions.oneQuestion)
    const isQnLoading = useSelector(state => state.questions.isLoading)
    const { isAuthenticated, user, isLoading } = useSelector(state => state.auth)
    const { toggleL } = useContext(logRegContext)

    // Access route parameters & history
    const { questionID } = useParams()


    // Lifecycle methods
    useEffect(() => {
        dispatch(getOneQuestion(questionID))
    }, [dispatch, questionID])

    useEffect(() => {
        if (quest) {
            setQuestionTextState({ questionText: quest.questionText })
            setQuestion_image(quest.question_image)
            setDurationState({ duration: quest.duration })
            setAnswerOptionsState(quest.answerOptions)
        }
    }, [quest])

    const thisQnCat = quest && quest.category
    const thisQnQZ = quest && quest.quiz

    const [questionTextState, setQuestionTextState] = useState({ questionText: '' })
    const [question_image, setQuestion_image] = useState('')
    const [durationState, setDurationState] = useState()
    const [answerOptionsState, setAnswerOptionsState] = useState(quest && quest.answerOptions)

    const onQuestionChangeHandler = e => {
        const { name, value } = e.target
        setQuestionTextState(questionTextState => ({ ...questionTextState, [name]: value }))
    }

    const onFileHandler = (e) => {
        setQuestion_image(e.target.files[0])
    }

    const onDurationChangeHandler = e => {
        const { name, value } = e.target
        setDurationState(durationState => ({ ...durationState, [name]: value }))
    }

    const handleAnswerChangeInput = (id, event) => {
        const updatedAnswerOptions = answerOptionsState.map(oneAnswer => {
            if (id === oneAnswer._id) {
                return {
                    ...oneAnswer, [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value
                }
            }
            return oneAnswer
        })
        setAnswerOptionsState(updatedAnswerOptions)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const formData = new FormData()

        // VALIDATE
        if (questionTextState.questionText.length < 4) {
            notify('Insufficient info!')
            return
        }
        else if (questionTextState.questionText.length > 700) {
            notify('Question is too long!')
            return
        }

        else if (answerOptionsState.length <= 1) {
            alert('Answers are not sufficient!')
            return
        }

        formData.append('questionText', questionTextState.questionText)
        answerOptionsState.forEach(aOptn => {
            formData.append('answerOptions', JSON.stringify(aOptn))
        })
        formData.append('last_updated_by', isLoading === false ? user._id : null)
        formData.append('duration', durationState.duration)

        // Attempt to update
        dispatch(updateQuestion({ questionID, formData }))
    }

    const handleAddFields = () => {
        setAnswerOptionsState([...answerOptionsState, { answerText: '', explanations: '', isCorrect: false }])
    }

    const handleRemoveFields = _id => {

        const values = [...answerOptionsState]
        values.splice(values.findIndex(value => value._id === _id), 1)

        setAnswerOptionsState(values)
    }

    return (
        isAuthenticated ?

            user.role !== 'Visitor' ?

                <Form className="my-3 mt-lg-5 mx-3 mx-lg-5 edit-question" onSubmit={handleSubmit}>

                    <Row className="mb-0 mb-lg-3 mx-0">
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to={`/category/${thisQnCat && thisQnCat._id}`}>
                                    {thisQnCat && thisQnCat.title}
                                </Link>
                            </BreadcrumbItem>

                            <BreadcrumbItem>
                                <Link to={`/view-quiz/${thisQnQZ && thisQnQZ.slug}`}>
                                    {thisQnQZ && thisQnQZ.title}
                                </Link>
                            </BreadcrumbItem>

                            <BreadcrumbItem active>Edit Question</BreadcrumbItem>
                        </Breadcrumb>
                    </Row>

                    <FormGroup row className="mx-0">
                        <Label sm={2}>Question Edit</Label>
                        <Col sm={10}>
                            <Input type="text" name="questionText" value={questionTextState && questionTextState.questionText} placeholder="Question here ..." onChange={onQuestionChangeHandler} required />
                        </Col>
                    </FormGroup>

                    <FormGroup row className="mx-0">
                        {question_image &&
                            <Col sm={12}>
                                <div className="my-3 mx-sm-5 px-sm-5 d-flex justify-content-center align-items-center">
                                    <img className="w-100 my-2 mt-lg-0" src={question_image} alt="Question Illustration" />
                                </div>
                            </Col>}

                        <Col sm={12}>
                            <Input bsSize="sm" type="file" accept=".jpg, .png, .jpeg, .svg" name="question_image" onChange={onFileHandler} label="Pick an image ..." id="question_image_pick" required />
                        </Col>
                    </FormGroup>

                    <FormGroup row className="mx-0">
                        <Label sm={2}>Question Duration</Label>
                        <Col sm={3}>
                            <Input type="number" name="duration" value={durationState && durationState.duration} placeholder="Time in seconds ..." onChange={onDurationChangeHandler} required />
                        </Col>
                    </FormGroup>

                    {answerOptionsState && answerOptionsState.map(answerOption => {

                        let explanation = answerOption.explanations ? answerOption.explanations : null

                        {/* If there is a word in the explanation paragraph that starts with http, make it a link */ }
                        if (explanation) {
                            let words = explanation.split(" ")
                            explanation = words.map(word => {
                                if (word.startsWith("http")) {
                                    return <a key={word} href={word} target="_blank" rel="noreferrer">{word} </a>
                                }
                                return word + " "
                            })
                        }
                        return (

                            <div key={answerOption._id}>

                                <FormGroup row className="mx-0">
                                    <Label sm={2}>Answer</Label>

                                    <Col sm={10} xl={7}>
                                        <Input type="text" name="answerText" value={answerOption.answerText}
                                            onChange={event => handleAnswerChangeInput(answerOption._id, event)} placeholder="Answer here ..." required />
                                    </Col>

                                    <Col sm={6} xl={2} className="my-3 my-sm-2 d-sm-flex justify-content-around">
                                        <Input type="checkbox" name="isCorrect" checked={answerOption.isCorrect}
                                            onChange={event => handleAnswerChangeInput(answerOption._id, event)} id={answerOption._id} label="Is Correct?" required />
                                    </Col>

                                    <Col sm={6} xl={1} className="my-3 my-sm-2">
                                        <Button className="px-2 py-1" disabled={answerOptionsState.length === 1} color="danger" onClick={() => handleRemoveFields(answerOption._id)}> - </Button>{' '}
                                        <Button className="px-2 py-1" color="danger" onClick={handleAddFields}> + </Button>{' '}
                                    </Col>

                                    {explanation && <>
                                        <Label sm={2}>Rationale</Label>
                                        <Col sm={10} xl={7}>
                                            <Input type="textarea" name="explanations" placeholder="Rationales or explanations ..." minLength="5" maxLength="1000" onChange={event => handleAnswerChangeInput(answerOption._id, event)} value={explanation} />
                                        </Col>
                                    </>}

                                </FormGroup>
                            </div>
                        )
                    })}

                    <FormGroup check row className="mx-0">
                        <Col sm={{ size: 10, offset: 2 }} className="pl-0">
                            <Button className="btn btn-info btn-sm" type="submit">Update</Button>
                        </Col>
                    </FormGroup>

                </Form> :

                <Dashboard /> :

            // If not authenticated or loading
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {
                    isLoading || isQnLoading ?
                        <QBLoadingSM /> :
                        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                            Login first
                        </Button>
                }
            </div>
    )
}

export default EditQuestion