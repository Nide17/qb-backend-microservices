import React from 'react'
import { Card, Button, CardTitle, CardText, Alert } from 'reactstrap'
import DeleteIcon from '../../images/trash.svg'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { deleteContact } from '../../redux/slices/contactsSlice'
import { useSelector, useDispatch } from "react-redux"

const ChatCard = ({ openChat }) => {

    const dispatch = useDispatch();

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const uRole = currentUser && currentUser.role
    const contacts = useSelector(state => state.contacts)
    const contactsToUse = contacts && ((uRole === 'Admin' || uRole === 'SuperAdmin') || uRole === 'Creator') ? contacts.allContacts : contacts.userContacts
    const isLoading = contacts && contacts.isLoading

    return (
        isLoading ? <Alert color="info" className="w-100 w-lg-50 mt-4 text-center mx-auto" style={{ border: '2px solid #157A6E' }}>Loading...</Alert> :
            contactsToUse && contactsToUse.length > 0 ?
                <>
                    {contactsToUse && contactsToUse.map(contact => (
                        <Card body key={contact._id}
                            className="m-1 p-1 mb-2"
                            style={{ height: "150px!important", overflowY: "unset!important" }}>

                            <CardTitle onClick={() => openChat(contact._id)}
                                className="p-1 d-flex justify-content-between"
                                style={{ fontSize: ".65rem", backgroundColor: "honeydew" }}>
                                <small style={{ width: "80%" }}>
                                    <b style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }} className='d-block overflow-hidden'>
                                        {contact.contact_name}
                                    </b>
                                    ({contact.email})
                                </small>

                                {contact.replies && contact.replies.length > 0 ?
                                    <b
                                        className='border bg-secondary text-warning text-center'
                                        style={{ padding: "4px", borderRadius: "50%", verticalAlign: "middle", width: "25px", height: "25px", fontSize: ".65rem" }}>
                                        {contact.replies.length}
                                    </b> :
                                    null}
                            </CardTitle>

                            <CardText onClick={() => openChat(contact._id)}
                                style={{ fontSize: ".7rem", marginLeft: "6px" }}>
                                {contact.message}
                            </CardText>
                            <div className="d-flex justify-content-between p-1" style={{ backgroundColor: "whitesmoke" }}>
                                <small className="d-flex align-items-center text-info" style={{ fontSize: ".65rem" }}>
                                    <i>
                                        {moment(new Date(contact.contact_date)).format('YYYY-MM-DD, HH:mm')}
                                    </i>
                                </small>

                                <Button size="sm" color="link" className={`me-2 ${(uRole === 'Admin' || uRole === 'SuperAdmin') ? '' : 'd-none'}`} onClick={() => dispatch(deleteContact(contact._id))}>
                                    <img src={DeleteIcon} alt="" width="16" height="16" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </> :
                <Alert color="danger" className="w-100 w-lg-50 mt-4 text-center mx-auto" style={{ border: '2px solid #157A6E' }}>
                    {uRole !== 'Visitor' ? 'No contacts yet!' : <Link to='/contact'>➕ Start new chat with us</Link>}
                </Alert>
    )
}

export default ChatCard