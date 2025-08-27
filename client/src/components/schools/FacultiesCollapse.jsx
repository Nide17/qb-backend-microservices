import React, { useState, useEffect } from 'react'
import { ListGroup, ListGroupItem, Button } from 'reactstrap'
import { Collapse } from "react-collapse"
import AddIcon from '../../images/plusIcon.svg'
import SubtractIcon from '../../images/minusIcon.svg'
import { getFaculties, deleteFaculty } from '../../redux/slices/facultiesSlice'
import { useSelector, useDispatch } from 'react-redux'
import EditFacultyModal from './EditFacultyModal'

import DeleteModal from '../../utils/DeleteModal'

const FacultiesCollapse = ({ levelID }) => {

    // Redux
    const faculties = useSelector(state => state.faculties)
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)

    // Lifecycle methods
    useEffect(() => { dispatch(getFaculties()) }, [dispatch])

    const levelFaculties = faculties && faculties.allFaculties.filter(fac => fac.level === levelID)
    const [activeState, setActiveState] = useState({ activeIndex: null })

    const toggleClass = (index, e) => {
        setActiveState({ activeIndex: activeState.activeIndex === index ? null : index })
    }

    let content
    const { activeIndex } = activeState

    content = levelFaculties && levelFaculties.length > 0 ?

        levelFaculties && levelFaculties.map((faculty, index) => {

            return (
                <li key={index}>
                    <div className="titleToggler">
                        <h3>{faculty.title}</h3>

                        <span className='d-flex me-3'>
                            <Button size="sm" color="link" className="mx-2">
                                <EditFacultyModal idToUpdate={faculty._id} editTitle={faculty.title} auth={auth} />
                            </Button>
                            <DeleteModal deleteFnName="deleteFaculty" deleteFn={deleteFaculty} delID={faculty._id} delTitle={faculty.title} />

                            <button className="btn btn-primary btn-xs" onClick={() => toggleClass(index)}>
                                <span>
                                    <img src={activeState.activeIndex === index ? SubtractIcon : AddIcon} alt="" width="24" height="24" className="mb-1" />
                                </span>
                            </button>
                        </span>
                    </div>

                    <Collapse isOpened={activeIndex === index}>
                        <div className={`alert alert-info msg ${activeIndex === index ? 'show' : 'hide'}`}>

                            <ListGroup>

                                {typeof faculty.years === 'object' ?
                                    faculty.years.map(yer => <ListGroupItem key={yer}>{yer}</ListGroupItem>) : null}
                            </ListGroup>

                        </div>
                    </Collapse>
                </li>
            )
        }) : null

    return (<ul className="docsList mt-lg-5">{content}</ul>)
}

export default FacultiesCollapse