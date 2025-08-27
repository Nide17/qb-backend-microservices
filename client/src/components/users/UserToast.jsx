import React from 'react'
import { Col, Toast, ToastBody, ToastHeader } from 'reactstrap'
import EditUser from './EditUser'
import uploadimage from '../../images/uploadimage.svg'
import moment from 'moment'
import ImageWithFallback from '../../utils/ImageWithFallback'
import DeleteModal from '../../utils/DeleteModal'
import { deleteUser } from '../../redux/slices/authSlice'
import { useSelector } from 'react-redux'

const UserToast = ({ user, fromSearch }) => {

    const auth = useSelector(state => state.auth)

    return (
        <Col sm="3" key={user._id} className={`mt-3 users-toast`}>

            <Toast>
                <ToastHeader className="text-dark overflow-auto">
                    <strong>{user.email}</strong>

                    {(auth && auth.user && auth.user.role) === 'SuperAdmin' ?
                        <div className="actions text-secondary d-flex">
                            <DeleteModal deleteFnName="deleteUser" deleteFn={deleteUser} delID={user._id} delTitle={user.name} />
                            <EditUser uId={user._id} uName={user.name} uRole={user.role} uEmail={user.email} />
                        </div> :
                        <span></span>}

                </ToastHeader>

                <ToastBody className={` ${fromSearch ? 'bg-light text-dark' : ''}`}>

                    <div className="userDetails d-flex align-items-center justify-content-around">
                        <div className="details d-flex flex-column w-50 p-1">
                            <p className="fw-bolder text-truncate text-info">{user.name}</p>
                            <small className='fw-bolder text-primary text-truncate text-capitalize'>{(user.school && user.school.title)}</small>
                            <small className='fw-bolder text-truncate text-capitalize text-dark'>{(user.faculty && user.faculty.title)}</small>
                            <small className='fw-bolder text-secondary text-truncate text-capitalize'>{(user.level && user.level.title)}</small>

                            <small className='fw-bolder text-secondary text-truncate text-capitalize pt-3'><i>Registered on {moment(new Date(user && user.register_date))
                                .format('YYYY-MM-DD, HH:mm')}</i></small>
                        </div>

                        <div className="illustration d-flex flex-column w-50">
                            <span className='illustration-image p-1 border rounded border-secondary'>
                                {/* <img src={user.image || uploadimage} alt='Profile illustration' /> */}
                                <ImageWithFallback
                                    src={user.image}
                                    fallbackSrc={uploadimage}
                                    alt="profile illustration"
                                />
                            </span>
                            <p className="fw-bolder text-center text-white bg-dark mt-2"><u>{user.role}</u></p>
                        </div>
                    </div>
                </ToastBody>
            </Toast>

        </Col>
    )
}

export default UserToast