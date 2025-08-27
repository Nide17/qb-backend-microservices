import React from "react"
import { NavItem, NavLink, Nav } from "reactstrap"
import { Link } from "react-router-dom"

import SubMenu from "./SubMenu"

const SideBar = ({ isOpen, toggle }) => (

  <div className={isOpen ? "sidebar is-open" : "sidebar"}>

    <div className="sidebar-header">
      <span color="info" onClick={toggle} style={{ color: "#fff" }}>
        X
      </span>
      <a href="/statistics">
        <h3>Quiz-Blog Statistics</h3>
      </a>
    </div>

    <div className="side-menu">
      <Nav vertical className="list-unstyled pb-3">

        <p>Titles</p>

        <SubMenu title="Users" icon={'user'} items={submenus[0]} />
        <SubMenu title="Users Stats" icon={'group'} items={submenus[1]} />
        <SubMenu title="Quizzes" icon={'keyboard-o'} items={submenus[2]} />
        <SubMenu title="Notes" icon={'book'} items={submenus[3]} />
        <SubMenu title="Categories" icon={'group'} items={submenus[4]} />
        <SubMenu title="Blog Posts" icon={'book'} items={submenus[5]} />

        {/* <NavItem>
          <NavLink tag={Link} to={"/statistics/about"} className="text-white">
            <i className="fa fa-address-book me-2"></i>
            About
          </NavLink>
        </NavItem> */}

      </Nav>
    </div>
  </div>
);

const submenus = [
  [
    {
      title: "50 Newest Users",
      target: "new-50-users",
    },
    {
      title: "With Image",
      target: "with-image",
    },
    {
      title: "With School",
      target: "with-school",
    },
    {
      title: "With Level",
      target: "with-level",
    },
    {
      title: "With Faculty",
      target: "with-faculty",
    },
    {
      title: "With Interests",
      target: "with-interests",
    },
    {
      title: "With About",
      target: "with-about",
    },
    {
      title: "All Users",
      target: "all-users",
    },
  ],
  [
    {
      title: "Top 100 Quizzing",
      target: "top-100-quizzing",
    },
    {
      title: "Top 100 Downloaders",
      target: "top-100-downloaders",
    },
  ],
  [
    {
      title: "Top 20 Quizzes",
      target: "top-20-quizzes",
    },
    {
      title: "Quizzes Stats",
      target: "quizzes-stats",
    },
  ],
  [
    {
      title: "Top 20 Notes",
      target: "top-20-notes",
    },
    {
      title: "Notes Stats",
      target: "notes-stats",
    },
  ],
  [
    {
      title: "Quiz Categories",
      target: "quiz-categories-stats",
    },
    {
      title: "Notes Categories",
      target: "notes-categories-stats",
    },
  ],
  [
    {
      title: "Recent 10 Views",
      target: "recent-ten-views",
    },
    {
      title: "All Views",
      target: "all-posts-views",
    },
  ],
];

export default SideBar;
