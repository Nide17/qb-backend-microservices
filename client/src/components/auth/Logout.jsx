import React from 'react'
import { Button, Modal, ModalBody, DropdownItem } from 'reactstrap'
import { logout } from '../../redux/slices/authSlice'
import { useDispatch } from "react-redux"
import powerOff from '../../images/power-off.svg'

const Logout = ({ userId, logoutModal, toggleLogoutModal }) => {

  const dispatch = useDispatch()

  const logingout = () => {
    dispatch(logout(userId))
    window.setTimeout(() => window.location.href = "/", 1000)
  }

  return (
    <>
      <DropdownItem onClick={toggleLogoutModal}>
        <span style={{ backgroundColor: "#ffc107", borderRadius: "3px", fontSize: ".7rem", fontWeight: 900, color: "#157A6E" }} className="p-1">
          <img src={powerOff} alt="logout to Quiz-Blog" width="16" height="16" />
          <span className='ms-1'>Sign Out</span>
        </span>
      </DropdownItem>

      <Modal isOpen={logoutModal} toggle={toggleLogoutModal} centered={true}>
        <div className="d-flex justify-content-between align-items-center pt-0 fw-bolder" style={{ color: "#157A6E" }}>
          Are you sure you want to logout?
          <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }}>
            X
          </Button>
        </div>

        <ModalBody className='d-flex justify-content-around align-items-center'>

          <Button style={{ marginTop: '2rem', backgroundColor: "red" }} onClick={logingout}>
            Logout
          </Button>

          <Button style={{ marginTop: '2rem', backgroundColor: "#157A6E" }} onClick={toggleLogoutModal}>
            Cancel
          </Button>

        </ModalBody>

      </Modal>
    </>
  )
}

export default Logout