import React, { useState, useContext, useEffect } from 'react'
import { Navbar, NavbarBrand, NavLink, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, ListGroup, ListGroupItem } from 'reactstrap'
import { Link, useLocation } from "react-router-dom"
import { useSelector } from 'react-redux'
import RegisterModal from '../auth/RegisterModal'
import LoginModal from '../auth/LoginModal'
import Logout from '../auth/Logout'
import CatDropdown from './CatDropdown'
import logo from '../../images/quizLogo.svg'
import { logRegContext } from '../../appContexts'
import EditPictureModal from '../auth/EditPictureModal'

const Header = ({ textContent }) => {

    const auth = useSelector(state => state.auth)
    const currentUser = auth && auth.user
    const { isOpenL, isOpenR, toggleL, toggleR } = useContext(logRegContext)
    const userId = currentUser && currentUser._id

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [logoutModal, setLogoutModal] = useState(false)

    const toggleDropdown = () => setDropdownOpen(prevState => !prevState)
    const toggleLogoutModal = () => setLogoutModal(prevState => !prevState)

    // location hook from react-router-dom    
    let location = useLocation()

    // intersection observer
    const [scrollPosition, setScrollPosition] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY)
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const bgColor = scrollPosition <= 70 ? '#157A6E' : '#f3f3f0'
    const clr = scrollPosition <= 70 ? '#f3f3f0' : '#157A6E'
    const logoBorder = scrollPosition <= 70 ? '#f3f3f0' : '#ffc107'

    const renderAuthLinks = () => (
        <span className="mx-0 p-0 text-warning d-flex justify-content-center align-items-center toDashboard" style={{ color: clr, border: `3px solid ${clr}`, borderRadius: "50px" }}>
            <EditPictureModal bgColor={bgColor} clr={clr} />
            <Link to="/#">
                <small className="ms-2 d-none d-lg-flex fw-bolder" style={{ color: clr }}>
                    {currentUser && currentUser.name && currentUser.name.toLowerCase().charAt(0).toUpperCase() + currentUser.name.slice(1).split(" ")[0]}
                </small>
            </Link>

            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle>
                    <span className='profileDropDown mx-2 mx-lg-3'>
                        <i className={`fa-solid fa-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ color: clr }}></i>
                    </span>
                </DropdownToggle>

                <DropdownMenu>
                    <DropdownItem header>
                        <ListGroup>
                            <ListGroupItem className='bg-warning'>
                                <h6 className='mb-0 fw-bolder text-white text-uppercase'>{currentUser && currentUser.name ? currentUser.name.split(" ")[0] : ''}</h6>
                            </ListGroupItem>
                            {renderProfileLinks()}
                        </ListGroup>
                    </DropdownItem>
                    <DropdownItem text>
                        <Link to="/dashboard" className="text-white" onClick={toggleDropdown}>Dashboard</Link>
                    </DropdownItem>
                    <DropdownItem text>
                        <Link to={`/edit-profile/${currentUser && currentUser._id}`} className="text-white" onClick={toggleDropdown}>Edit Profile</Link>
                    </DropdownItem>
                    <Logout userId={userId} logoutModal={logoutModal} toggleLogoutModal={toggleLogoutModal} />
                </DropdownMenu>
            </Dropdown>
        </span>
    )

    const renderProfileLinks = () => (
        <>
            <ListGroupItem>
                {currentUser && currentUser.school ? (
                    <Link to={`/edit-profile/${currentUser && currentUser._id}`}>
                        <span className={`${currentUser && !currentUser.school ? 'text-danger' : ''}`}>
                            {(currentUser && currentUser.school.title)}
                        </span>
                    </Link>
                ) : (
                    <Link to={`/edit-profile/${currentUser && currentUser._id}`}>Please add a school</Link>
                )}
            </ListGroupItem>
            <ListGroupItem>
                {currentUser && currentUser.level ? (
                    <Link to={`/edit-profile/${currentUser && currentUser._id}`}>
                        <span className={`${currentUser && !currentUser.level ? 'text-danger' : ''}`}>
                            {(currentUser && currentUser.level.title)}
                        </span>
                    </Link>
                ) : (
                    <Link to={`/edit-profile/${currentUser && currentUser._id}`}>Please add a level</Link>
                )}
            </ListGroupItem>
            <ListGroupItem>
                {currentUser && currentUser.faculty ? (
                    <Link to={`/edit-profile/${currentUser && currentUser._id}`}>
                        <span className={`${currentUser && !currentUser.faculty ? 'text-danger' : ''}`}>
                            {(currentUser && currentUser.faculty.title)}
                        </span>
                    </Link>
                ) : (
                    <Link to={`/edit-profile/${currentUser && currentUser._id}`}>Please add a faculty</Link>
                )}
            </ListGroupItem>
            <ListGroupItem>
                {currentUser && currentUser.year ? (
                    <Link to={`/edit-profile/${currentUser && currentUser._id}`}>
                        <span className={`${currentUser && !currentUser.year ? 'text-danger' : ''}`}>
                            {(currentUser && currentUser.year)}
                        </span>
                    </Link>
                ) : (
                    <Link to={`/edit-profile/${currentUser && currentUser._id}`}>Please add a year</Link>
                )}
            </ListGroupItem>
        </>
    )

    const renderGuestLinks = () => (
        <>
            <span className="me-1 me-md-4 login-modal">
                <NavLink onClick={toggleL} style={{ border: `2px solid ${scrollPosition <= 70 ? '#ffc107' : clr}`, color: clr, fontWeight: "bold" }}>
                    {textContent || 'Login'}
                </NavLink>
                <LoginModal isOpenL={isOpenL} toggleL={toggleL} toggleR={toggleR} />
            </span>
            <span className="me-0 register-modal">
                <NavLink onClick={toggleR} style={{ border: `2px solid ${scrollPosition <= 70 ? '#ffc107' : clr}`, color: clr, fontWeight: "bold" }}>
                    Register
                </NavLink>
                <RegisterModal isOpenR={isOpenR} toggleR={toggleR} toggleL={toggleL} />
            </span>
        </>
    )

    if (location.pathname.startsWith('/statistics')) {
        return null
    }

    return (
        <header style={{ boxShadow: "0 1px 2px -1px rgba(0,0,0,0.5)" }} className="sticky-top">
            <Navbar light expand="lg" className="px-0 px-lg-5 pb-2 pt-1 py-md-3" style={{ backgroundColor: bgColor, color: clr }}>
                <NavbarBrand href="/" style={{ fontWeight: "900" }} className='mb-1'>
                    <img src={logo} alt="Quiz-Blog Logo" style={{ border: `3px solid ${logoBorder}`, borderRadius: "10px", maxHeight: "3.2rem" }} />
                </NavbarBrand>
                <div className="collapse px-1 px-sm-2 py-1 mx-1 m-sm-0" style={{ borderColor: clr }}>
                    {location.pathname !== '/' && (
                        <Button color="success" size="md" className="ms-1 me-2 px-md-2 me-md-4 back-home d-none d-sm-inline-flex" style={{ border: `3px solid ${clr}` }}>
                            <Link to="/" className="back-home-link" style={{ color: "white", fontWeight: "bold" }}>
                                Back Home
                            </Link>
                        </Button>
                    )}
                    <CatDropdown clr={clr} />
                    <span className="me-1 ms-sm-4 me-md-4">
                        <Link to="/course-notes" style={{ color: clr, fontWeight: "bold" }}>Notes</Link>
                    </span>
                    <span className="me-1 me-md-4">
                        <Link to="/blog" style={{ color: clr, fontWeight: "bold" }}>Blog</Link>
                    </span>
                    <span className="me-1 me-md-4">
                        <Link to="/about" style={{ color: clr, fontWeight: "bold" }}>About</Link>
                    </span>
                    <span className="me-1 me-md-4">
                        <Link to="/contact" style={{ color: clr, fontWeight: "bold" }}>Contact</Link>
                    </span>
                    {currentUser ? renderAuthLinks() : renderGuestLinks()}
                </div>
            </Navbar>
        </header>
    )
}

export default Header