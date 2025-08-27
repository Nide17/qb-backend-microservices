import React, { useState, useEffect, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Button, Col, Form, FormGroup, Label, Input, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import Dashboard from '../dashboard/Dashboard'
import { addQuestion, getQuestions } from '../../redux/slices/questionsSlice'
import { getOneQuiz, notifying } from '../../redux/slices/quizesSlice'
import { useDispatch, useSelector } from 'react-redux'
import QBLoadingSM from '../rLoading/QBLoadingSM'
import { logRegContext } from '../../appContexts'

const CreateQuestions = () => {

    // Redux
    const oneQuiz = useSelector(state => state.quizes.oneQuiz)
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const isAuthenticated = useSelector(state => state.auth && state.auth.isAuthenticated)

    const dispatch = useDispatch()
    const { toggleL } = useContext(logRegContext)

    // Access route parameters
    const { quizSlug } = useParams()
    const [questionText, setQuestionText] = useState({
        questionText: '',
    })

    const [question_image, setQuestion_image] = useState('')
    const [durationState, setDurationState] = useState({
        duration: 24
    })

    const [answerOptions, setAnswerOptions] = useState([
        { id: uuidv4(), answerText: '', explanations: '', isCorrect: false },
    ])

    // Lifecycle methods
    useEffect(() => {
        dispatch(getOneQuiz(quizSlug))
        dispatch(getQuestions(quizSlug))
    }, [dispatch, quizSlug])

    const onQuestionChangeHandler = e => {

        const { name, value } = e.target
        setQuestionText(state => ({ ...state, [name]: value }))
    }

    const onFileHandler = (e) => {
        setQuestion_image(e.target.files[0])
    }

    const onDurationChangeHandler = e => {

        const { name, value } = e.target
        setDurationState(durationState => ({ ...durationState, [name]: value }))
    }

    const handleAnswerChangeInput = (id, event) => {

        const newAnswerOptions = answerOptions.map(i => {
            if (id === i.id) {
                event.target.type === "checkbox" ?
                    i[event.target.name] = event.target.checked :
                    i[event.target.name] = event.target.value
            }
            return i
        })

        setAnswerOptions(newAnswerOptions)
    }

    const validateForm = () => {
        const trueAnswer = answerOptions.find(ansop => ansop.isCorrect === true)
        if (!questionText.questionText && !question_image) {
            notify('Please give the title or upload question image!')
            return false
        } else if (questionText.questionText.length < 4) {
            notify('Insufficient info!')
            return false
        } else if (questionText.questionText.length > 700) {
            notify('Question is too long!')
            return false
        } else if (answerOptions.length <= 1) {
            notify('Answers are not sufficient!')
            return false
        } else if (!trueAnswer) {
            notify('Please provide a true answer!')
            return false
        }
        return true
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateForm()) return

        const formData = new FormData()
        formData.append('question_image', question_image)
        formData.append('questionText', questionText.questionText)
        answerOptions.forEach(aOptn => {
            formData.append('answerOptions', JSON.stringify(aOptn))
        })
        formData.append('category', oneQuiz.category && oneQuiz.category._id)
        formData.append('quiz', oneQuiz && oneQuiz._id)
        formData.append('created_by', auth.isLoading === false ? currentUser._id : null)
        formData.append('duration', durationState.duration)

        // Attempt to create
        dispatch(addQuestion(formData))

        // Reset form fields
        setQuestionText({ questionText: '' })
        setQuestion_image('')
        setDurationState({ duration: 24 })
        setAnswerOptions([{ id: uuidv4(), answerText: '', explanations: '', isCorrect: false }])
    }

    const handleAddFields = () => {
        setAnswerOptions([...answerOptions, { id: uuidv4(), answerText: '', explanations: '', isCorrect: false }])
    }

    const handleRemoveFields = id => {
        const values = [...answerOptions]
        values.splice(values.findIndex(value => value.id === id), 1)
        setAnswerOptions(values)
    }

    const SendNotification = (quiz_Id, title, category, created_by) => {

        const newQuizInfo = {
            quiz_Id,
            title,
            category,
            created_by
        }

        // Attempt to notify
        dispatch(notifying(newQuizInfo))
    }

    return (
        isAuthenticated ?

            currentUser.role !== 'Visitor' ?

                <Form className="my-3 mt-lg-5 mx-3 mx-lg-5 create-question" onSubmit={handleSubmit}>

                    <div key={oneQuiz._id} className="mb-0 mb-lg-3 mx-0">
                        <Breadcrumb key={oneQuiz._id}>
                            <BreadcrumbItem><Link to="/dashboard">{oneQuiz.category && oneQuiz.category.title}</Link></BreadcrumbItem>
                            <BreadcrumbItem><Link to={`/category/${oneQuiz.category && oneQuiz.category._id}`}>{oneQuiz.title}</Link></BreadcrumbItem>
                            <BreadcrumbItem active>Create Question</BreadcrumbItem>
                        </Breadcrumb>

                        <Button
                            size="sm"
                            color="danger"
                            style={{ display: "block", marginLeft: "auto", border: "3px solid black" }}
                            onClick={() => SendNotification(oneQuiz._id, oneQuiz.title, oneQuiz.category && oneQuiz.category.title, oneQuiz.created_by && oneQuiz.created_by.name)}>
                            Finish & Notify
                        </Button>
                    </div>

                    <FormGroup row className="mx-0">
                        <Label sm={2}>Question</Label>
                        <Col sm={10}>
                            <Input type="text" name="questionText" value={questionText.questionText || ""} placeholder="Question here ..." onChange={onQuestionChangeHandler} required />
                        </Col>
                    </FormGroup>

                    <FormGroup row className="mx-0">
                        <Label sm={2} for="question_image">
                            <strong>Upload</strong>&nbsp;
                            <small className="text-info">.jpg, .png, .jpeg, .svg</small>
                        </Label>
                        <Col sm={10}>
                            <Input bsSize="sm" type="file" accept=".jpg, .png, .jpeg, .svg" name="question_image" onChange={onFileHandler} label="Pick an image ..." id="question_image_pick" required />
                        </Col>
                    </FormGroup>

                    <FormGroup row className="mx-0">
                        <Label sm={2}>Question Duration</Label>
                        <Col sm={3}>
                            <Input type="number" name="duration" value={durationState.duration || 0} placeholder="Time in seconds ..." onChange={onDurationChangeHandler} required />
                        </Col>
                    </FormGroup>

                    {answerOptions.map(answerOption => {

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
                            <div key={answerOption.id}>
                                <FormGroup row className="mx-0">
                                    <Label sm={2}>Answer</Label>

                                    <Col sm={10} xl={7}>
                                        <Input type="text" name="answerText" value={answerOption.answerText}
                                            onChange={event => handleAnswerChangeInput(answerOption.id, event)} id="exampleanswer" placeholder="Answer here ..." required />
                                    </Col>

                                    <Col sm={6} xl={2} className="my-3 my-sm-2 d-sm-flex justify-content-around">
                                        <Input type="checkbox" name="isCorrect" value={answerOption.isCorrect}
                                            onChange={event => handleAnswerChangeInput(answerOption.id, event)} id={answerOption.id} label="Is Correct?" required />
                                    </Col>

                                    <Col sm={6} xl={1} className="my-3 my-sm-2">
                                        <Button className="px-2 py-1" disabled={answerOptions.length === 1} color="danger" onClick={() => handleRemoveFields(answerOption.id)}> - </Button>{' '}
                                        <Button className="px-2 py-1" color="danger" onClick={handleAddFields}> + </Button>{' '}
                                    </Col>

                                    {explanation && <>
                                        <Label sm={2}>Rationale</Label>
                                        <Col sm={10} xl={7}>
                                            <Input type="textarea" name="explanations" placeholder="Rationales or explanations ..." minLength="5" maxLength="1000" onChange={event => handleAnswerChangeInput(answerOption.id, event)} value={explanation} />
                                        </Col>
                                    </>}
                                </FormGroup>
                            </div>
                        )
                    })}

                    <FormGroup check row className="mx-0 pl-3">
                        <Col sm={{ size: 10, offset: 2 }} className="pl-0">
                            <Button className="btn btn-info btn-sm" type="submit" onClick={handleSubmit}>Add New</Button>
                        </Col>
                    </FormGroup>
                </Form> :
                <Dashboard /> :

            // If not authenticated or loading
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {
                    auth.isLoading ?
                        <QBLoadingSM /> :
                        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                            Login first
                        </Button>
                }
            </div>
    )
}

export default CreateQuestions