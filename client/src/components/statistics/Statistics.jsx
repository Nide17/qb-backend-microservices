import React, { useState, useContext } from "react"
import { useSelector } from "react-redux"
import { Button } from "reactstrap"
import SideBar from "./sidebar/SideBar"
import Content from "./content/Content"
import Dashboard from "../dashboard/Dashboard"
import QBLoadingSM from "../rLoading/QBLoadingSM"
import "./statistics.css"
import { logRegContext } from "../../appContexts"

const Statistics = () => {

  const { toggleL } = useContext(logRegContext)
  const [sidebarIsOpen, setSidebarOpen] = useState(true)
  const toggleSidebar = () => setSidebarOpen(!sidebarIsOpen)
  const auth = useSelector(state => state.auth)
  const isAuthenticated = auth.isAuthenticated

  if (auth.isLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
        <QBLoadingSM />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-danger">
        <Button color="link" className="fw-bolder my-5 border rounded" onClick={toggleL} style={{ backgroundColor: "#ffc107", color: "#157A6E", fontSize: "1.5vw", boxShadow: "-2px 2px 1px 2px #157A6E", border: "2px solid #157A6E" }}>
          Login first
        </Button>
      </div>
    )
  }

  if (auth.user.role === 'Visitor') {
    return <Dashboard />
  }

  return (
    <div className="Statistics wrapper">
      <SideBar toggle={toggleSidebar} isOpen={sidebarIsOpen} />
      <Content toggleSidebar={toggleSidebar} sidebarIsOpen={sidebarIsOpen} />
    </div>
  )
}

export default Statistics
