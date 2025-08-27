import React from 'react'

const Unavailable = ({ title, link, more }) => {
    return (
        <div className="py-4 py-lg-0 d-flex flex-column justify-content-center align-items-center">
            <h4 className="p-2 text-danger" style={{ fontSize: ".9rem", fontWeight: "bold", }}>
                {title}
            </h4>

            <p>
                <a href={link} style={{ textDecoration: "none", color: "#157A6E", fontSize: ".9rem", fontWeight: "bold", }}>
                    <span role="img" aria-label="pointing">👉</span>&nbsp;<u>click here for more {more}</u>
                </a>
            </p>
        </div>
    )
}

export default Unavailable
