import React, { useState, useEffect, useRef } from 'react'
import { Form, Button } from 'reactstrap'
import { useSelector, useDispatch } from "react-redux"
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import moment from 'moment'
import { replyContact } from '@/redux/slices/contactsSlice'
import QBLoadingSM from '@/components/rLoading/QBLoadingSM'
import { notify } from '@/utils/notifyToast'
import { socket } from '@/utils/socket'
import SingleReply from './SingleReply'

const ChatMessages = ({ onlineList }) => {
    const { oneContact, isLoading } = useSelector(state => state.contacts)
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const lastMessageRef = useRef(null)
    const [replies, setReplies] = useState(oneContact ? oneContact.replies : [])
    const [editorState, setEditorState] = useState(EditorState.createEmpty())

    const toMail = currentUser.role === 'Visitor' ? 'quizblog.rw@gmail.com' : oneContact?.email
    const whoWith = currentUser.role === 'Visitor' ? { username: 'Quiz-Blog Rwanda', email: 'quizblog.rw@gmail.com' } : { username: oneContact?.contact_name, email: oneContact?.email }
    const onlineStatus = onlineList.some(user => user.email === toMail) ? '🟢' : '🔴'

    useEffect(() => {
        if (oneContact?.message) {
            try {
                const content = convertFromRaw(JSON.parse(oneContact.message))
                setEditorState(EditorState.createWithContent(content))
            } catch (error) { }
        }
    }, [oneContact])

    useEffect(() => {
        if (oneContact) {
            setReplies(oneContact.replies || [])
        }
    }, [oneContact])

    const sendMessage = e => {
        e.preventDefault()
        const raw = convertToRaw(editorState.getCurrentContent())
        const string = JSON.stringify(raw)

        const newReply = {
            reply_name: currentUser.name,
            email: currentUser.email,
            to_contact: toMail,
            to_contact_name: oneContact.contact_name,
            contact_question: oneContact.message,
            message: string
        }

        dispatch(replyContact({ idToUpdate: oneContact._id, reply: newReply }))
        setEditorState(EditorState.createEmpty())
    }

    useEffect(() => {
        const handleReplyReceived = replyReceived => {
            setReplies(prevReplies => [...prevReplies, replyReceived])
            if (replyReceived.email !== currentUser.email) {
                notify(`${replyReceived.reply_name} replied to your message`)
            }
        }

        socket.on('replyReceived', handleReplyReceived)
        return () => socket.off('replyReceived', handleReplyReceived)
    }, [currentUser.email])

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [replies])

    return (
        isLoading ? <QBLoadingSM title='chat messages' /> :
            <div className='h-100'>
                <h4 className='text-center py-2 py-lg-4 mt-5 mt-lg-3 fw-bolder border rounded' style={{ backgroundColor: "burlywood" }}>
                    {whoWith.username}&nbsp;
                    <small style={{ fontSize: ".5rem", verticalAlign: "middle" }}>{onlineStatus}</small>
                </h4>
                <strong>{oneContact?.message}</strong>
                <small className="text-info mb-2">
                    <i className='text-start d-block mt-2' style={{ fontSize: ".7rem", color: "#6a89cc" }}>
                        {moment(new Date(oneContact?.contact_date)).format('YYYY-MM-DD, HH:mm')}
                    </i>
                </small>
                <hr />
                {replies.map((reply, index) => <SingleReply key={index} reply={reply} />)}
                <hr />
                <Form className='w-100 m-1 pb-3 mb-lg-5 d-flex flex-column align-center justify-center' onSubmit={sendMessage}>
                    <Editor
                        editorState={editorState}
                        onEditorStateChange={setEditorState}
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        toolbarClassName="toolbar-class"
                        spellCheck={true}
                        placeholder="Type your message here..."
                        toolbar={{
                            fontFamily: { options: ['Tw Cen MT', 'Amiri', 'Helvetica', "Trebuchet MS", 'sans-serif'] },
                        }}
                        editorStyle={{ height: '200px' }}
                    />
                    <Button className='mx-auto w-50 mt-4' style={{ height: "max-content", backgroundColor: "#157A6E" }}>
                        Send
                    </Button>
                    <div ref={lastMessageRef} />
                </Form>
            </div>
    )
}

export default ChatMessages
