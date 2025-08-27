import React, { useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, NavLink } from 'reactstrap'
import trash from '../images/trash.svg'
import { useDispatch } from "react-redux"

const DeleteModal = ({ delID, delTitle, deleteFn, deleteFnName }) => {

    const dispatch = useDispatch()

    //properties of the modal
    const [modal, setModal] = useState(false)

    //showing and hiding modal
    const toggle = () => setModal(!modal)

    const onDeleteHandler = e => {
        e.preventDefault()

        // Attempt to delete
        dispatch(deleteFn(delID))
    }

    return (
        <>
            <NavLink onClick={toggle} className="text-dark p-0 mx-2">
                <img src={trash} alt="" width="16" height="16" />
            </NavLink>

            <Modal centered fullscreen="md" size="md" isOpen={modal} toggle={toggle} style={{ boxShadow: "none" }} className="delete-modal">
                <div className="d-flex justify-content-between align-items-center p-2" style={{ backgroundColor: "#157A6E", color: "#fff" }}>
                    Deleting ...
                    <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggle}>
                        X
                    </Button>
                </div>

                <ModalBody className="text-center my-4" style={{ backgroundColor: "#f8d7da", fontSize: ".8rem" }}>
                    Delete "<u>{delTitle}</u>" permanently?
                </ModalBody>

                <ModalFooter className="justify-content-around pb-0">
                    <Button color="danger" onClick={onDeleteHandler} >
                        Confirm
                    </Button>
                    <Button color="success" outline onClick={toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default DeleteModal