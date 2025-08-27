import React from "react"
import { Container } from "reactstrap"
import { Outlet } from "react-router-dom"

import Topbar from "./Topbar"
import Charts from "./Charts"

const Content = ({ sidebarIsOpen, toggleSidebar }) => (
  <Container fluid className={sidebarIsOpen ? "content is-open" : "content"}>

    <Topbar toggleSidebar={toggleSidebar} />
    
    {
      (window.location.pathname === "/statistics" || window.location.pathname === "/statistics/") && <Charts />
    }

    <Outlet />
  </Container>
)

export default Content
