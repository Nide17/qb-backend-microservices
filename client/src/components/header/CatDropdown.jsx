import React, { useState } from 'react'
import { Link } from "react-router-dom"
import { useSelector } from 'react-redux'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap'

const CatDropdown = ({ clr }) => {

    const categories = useSelector(state => state.categories)
    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(!isOpen)

    return (
        categories.isLoading ? null :
            <Dropdown isOpen={isOpen} toggle={toggle} className="profileDropDown position-static">

                <DropdownToggle className="bg-transparent border-0 profileDropDown-btn" style={{ padding: "0", color: clr, fontWeight: "bolder" }}>
                    <span className='me-1'>
                        Quizes <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} ms-lg-1`}></i>
                    </span>
                </DropdownToggle>

                <DropdownMenu style={{ backgroundColor: "#fff", width: "max-content", border: "2px solid #157A6E" }} onClick={toggle}>
                    <DropdownItem text className="text-uppercase d-flex justify-content-end align-items-center">
                        <Button className="btn-danger text-uppercase text-red" style={{ padding: "0.1rem 0.3rem", fontSize: ".6rem", fontWeight: "bold" }} onClick={toggle}>
                            X
                        </Button>
                    </DropdownItem>

                    {categories.allcategories && categories.allcategories.map(category => (
                        <DropdownItem text key={category._id} className="my-1 text-uppercase">
                            <Link to={`/category/${category._id}`} style={{ color: "#157A6E", }} className="text-decoration-none" onClick={toggle}>
                                {category.title}
                            </Link>
                        </DropdownItem>))}
                </DropdownMenu>
            </Dropdown>
    )
}

export default CatDropdown