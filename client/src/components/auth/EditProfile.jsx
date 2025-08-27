import React, { useState, useEffect, useContext } from 'react'
import { Button, Row, Col, Form, FormGroup, Label, Input, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux"
import { updateProfile } from '../../redux/slices/authSlice'
import { getSchools } from '../../redux/slices/schoolsSlice'
import { fetchSchoolLevels } from '../../redux/slices/levelsSlice'
import { fetchLevelFaculties } from '../../redux/slices/facultiesSlice'
import { logRegContext } from '../../appContexts'
import QBLoadingSM from '../rLoading/QBLoadingSM'

const EditProfile = () => {

    const { userId } = useParams()
    const dispatch = useDispatch()

    const { currentUser, isAuthenticated, isLoading } = useSelector(state => state.auth)
    const { toggleL } = useContext(logRegContext)
    const schools = useSelector(state => state.schools && state.schools.allSchools)
    const schoolLevels = useSelector(state => state.levels && state.levels.schoolLevels)
    const levelFaculties = useSelector(state => state.faculties && state.faculties.levelFaculties)

    const [profileState, setProfileState] = useState(currentUser || {})
    const [interestsState, setInterestsState] = useState(currentUser?.interests || [])
    const [yearsState, setYearsState] = useState([])

    useEffect(() => {

        setProfileState(currentUser || {})
        setInterestsState(currentUser?.interests || [])
    }, [currentUser])

    useEffect(() => {
        dispatch(getSchools())
    }, [dispatch])

    useEffect(() => {
        if (profileState.school) {
            dispatch(fetchSchoolLevels(profileState.school._id))
        }
    }, [dispatch, profileState.school])

    useEffect(() => {
        if (profileState.level) {
            dispatch(fetchLevelFaculties(profileState.level._id))
        }
    }, [dispatch, profileState.level])

    useEffect(() => {
        if (profileState.faculty) {
            const faculty = levelFaculties.find(fac => fac._id === profileState.faculty._id)
            setYearsState(faculty?.years || [])
        }
    }, [profileState.faculty, levelFaculties])

    const handleSelectChange = (e, field, fetchAction, list) => {
        const value = e.target.value || null
        const selectedObject = list ? list.find(item => item._id === value) : value

        setProfileState(prevState => ({
            ...prevState,
            [field]: selectedObject
        }))

        if (fetchAction && value) dispatch(fetchAction(value))
    }

    const handleInputChange = e => {
        const { name, value } = e.target
        setProfileState(prevState => ({ ...prevState, [name]: value }))
    }

    const handleInterestsChange = (index, e) => {
        const { name, value } = e.target
        setInterestsState(prevState => prevState.map((interest, i) => i === index ? { ...interest, [name]: value } : interest))
    }

    const handleAddInterest = () => {
        setInterestsState(prevState => [...prevState, { favorite: '' }])
    }

    const handleRemoveInterest = index => {
        setInterestsState(prevState => prevState.filter((_, i) => i !== index))
    }

    const handleSubmit = e => {
        e.preventDefault()
        const { name, school, level, faculty, year, about } = profileState

        if (name.length < 4) return notify('Insufficient info!')
        if (school && (!year || !faculty || !level)) return notify('Year, Faculty & Level required!')
        if (about.length > 2000) return notify('Too long!')
        if (interestsState.length > 20) return alert('Limit reached!')

        const updatedProfile = {
            uId: userId,
            name,
            school: school || null,
            level: level || null,
            faculty: faculty || null,
            year: year || null,
            interests: interestsState,
            about
        }
        dispatch(updateProfile(updatedProfile))
    }

    return (
        isAuthenticated ?
            <Form className="my-3 mt-lg-5 mx-3 mx-lg-5 edit-question" onSubmit={handleSubmit}>
                <Row className="mb-0 mb-lg-3 mx-0">
                    <Breadcrumb>
                        <BreadcrumbItem>{currentUser?.name}</BreadcrumbItem>
                        <BreadcrumbItem>{currentUser?.email}</BreadcrumbItem>
                        <BreadcrumbItem active>Edit Profile</BreadcrumbItem>
                    </Breadcrumb>
                </Row>

                <FormGroup row className="mx-0">
                    <Label sm={3}>Update Name</Label>
                    <Col sm={7}>
                        <Input type="text" name="name" value={profileState.name || ''} placeholder="Name here ..." onChange={handleInputChange} />
                    </Col>
                    <Col sm={2}>
                        <Input disabled type="text" value='Current Record' className='text-success' />
                    </Col>
                </FormGroup>

                <FormGroup row className="mx-0">
                    <Label sm={3}>Update School</Label>
                    <Col sm={7}>
                        <Input type="select" className="form-control" onChange={e => handleSelectChange(e, 'school', fetchSchoolLevels, schools)} value={profileState.school?._id || ''} required>
                            {profileState.school ? <option>{profileState.school.title}</option> : <option>-- Select your school--</option>}
                            {schools.map(school => <option key={school._id} value={school._id}>{school.title}</option>)}
                        </Input>
                    </Col>
                    <Col sm={2}>
                        <Input disabled type="text" value={profileState.school?.title || ''} style={{ color: "#157A6E" }} />
                    </Col>
                </FormGroup>

                <FormGroup row className={`mx-0`}>
                    <Label sm={3}>Update Level</Label>
                    <Col sm={7}>
                        <Input type="select" className="form-control" onChange={e => handleSelectChange(e, 'level', fetchLevelFaculties, schoolLevels)} value={profileState.level?._id || ''} required>
                            {profileState.level ? <option>{profileState.level.title}</option> : <option>-- Select your level--</option>}
                            {schoolLevels.map(level => <option key={level._id} value={level._id}>{level.title}</option>)}
                        </Input>
                    </Col>
                    <Col sm={2}>
                        <Input disabled type="text" value={profileState.level?.title || ''} />
                    </Col>
                </FormGroup>

                <FormGroup row className={`mx-0`}>
                    <Label sm={3}>Update Faculty</Label>
                    <Col sm={7}>
                        <Input type="select" className="form-control" onChange={e => handleSelectChange(e, 'faculty', null, levelFaculties)} value={profileState.faculty?._id || ''} required>
                            {profileState.faculty ? <option>{profileState.faculty.title}</option> : <option>-- Select your faculty--</option>}
                            {levelFaculties.map(faculty => <option key={faculty._id} value={faculty._id}>{faculty.title}</option>)}
                        </Input>
                    </Col>
                    <Col sm={2}>
                        <Input disabled type="text" value={profileState.faculty?.title || ''} />
                    </Col>
                </FormGroup>

                <FormGroup row className={`mx-0`}>
                    <Label sm={3}>Update Year</Label>
                    <Col sm={7}>
                        <Input type="select" className="form-control" onChange={e => handleSelectChange(e, 'year')} value={profileState.year || ''} required>
                            {profileState.year ? <option>{profileState.year}</option> : <option>-- Select your year--</option>}
                            {yearsState.map(year => <option key={year} value={year}>{year}</option>)}
                        </Input>
                    </Col>
                    <Col sm={2}>
                        <Input disabled type="text" value={''} />
                    </Col>
                </FormGroup>

                {interestsState.length < 1 ?
                    <FormGroup row className="mx-0">
                        <Label sm={3}>Update Interest</Label>
                        <Col sm={9} className="my-3 my-sm-2">
                            <strong className='text-info'>Add Favorite Subject &nbsp;</strong>
                            <Button className="px-2 py-1" color="success" onClick={handleAddInterest}> + </Button>{' '}
                        </Col>
                    </FormGroup> :
                    interestsState.map((interest, index) => (
                        <FormGroup row className="mx-0" key={index}>
                            <Label sm={3}>Update Interest</Label>
                            <Col sm={7}>
                                <Input type="text" name="favorite" value={interest.favorite || ''} placeholder="New interest here ..." onChange={e => handleInterestsChange(index, e)} />
                            </Col>
                            <Col sm={2} className="my-3 my-sm-2">
                                <Button className="px-2 py-1" disabled={interestsState.length <= 1} color="danger" onClick={() => handleRemoveInterest(index)}> - </Button>{' '}
                                <Button className="px-2 py-1" color="success" onClick={handleAddInterest}> + </Button>{' '}
                            </Col>
                        </FormGroup>
                    ))
                }

                <FormGroup row className="mx-0">
                    <Label sm={3}>Update About You</Label>
                    <Col sm={9}>
                        <Input type="textarea" name="about" placeholder="about you ..." minLength="5" maxLength="2000" onChange={handleInputChange} value={profileState.about || ''} />
                    </Col>
                </FormGroup>

                <FormGroup check row className="mx-0 mt-md-4">
                    <Col sm={{ size: 10, offset: 2 }} className="pl-0">
                        <Button className="btn btn-info text-white" type="submit" style={{ backgroundColor: "#157A6E" }}>
                            Update
                        </Button>
                    </Col>
                </FormGroup>
            </Form> :
            <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
                {isLoading ? <QBLoadingSM /> :
                    <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
                        Login first
                    </Button>
                }
            </div>
    )
}

export default EditProfile