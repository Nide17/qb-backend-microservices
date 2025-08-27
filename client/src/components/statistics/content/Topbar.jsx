import React, { useState } from "react"
import { Navbar, Button, NavbarToggler, Collapse, Nav, NavItem, NavLink } from "reactstrap"
import { Link } from "react-router-dom"
import Logout from '../../auth/Logout'
import { useSelector } from "react-redux"

const Topbar = ({ toggleSidebar }) => {

  const auth = useSelector(state => state.auth)
  const currentUser = auth && auth.user
  const [topbarIsOpen, setTopbarOpen] = useState(true)
  const toggleTopbar = () => setTopbarOpen(!topbarIsOpen)

  const userName = currentUser && currentUser.name
  const userId = currentUser && currentUser._id

  return (
    <Navbar color="light" light
      className="navbar shadow-sm p-3 my-2 bg-white rounded" expand="md"
      style={{ position: "sticky", top: "0", zIndex: "2" }}>

      <Button color="info" onClick={toggleSidebar}>
        <i className="fa fa-align-left me-2"></i>
      </Button>

      <NavbarToggler onClick={toggleTopbar} />
      <Collapse isOpen={topbarIsOpen} navbar>

        <strong className="fw-bolder ms-4">
          {userName && userName}
        </strong>

        <Nav className="ms-auto align-items-center" navbar>

          <NavItem>
            <NavLink tag={Link} to={"/"} className="text-success fw-bolder">
              Home
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink tag={Link} to={"/dashboard"} className="text-success fw-bolder">
              Dashboard
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink tag={Link} to={"/course-notes"} className="text-success fw-bolder">
              Notes
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink tag={Link} to={"/blog"} className="text-success fw-bolder">
              Blog
            </NavLink>
          </NavItem>

          <NavItem>
            <Logout userId={userId} />
          </NavItem>

        </Nav>

      </Collapse>
    </Navbar>
  )
}
export default Topbar
