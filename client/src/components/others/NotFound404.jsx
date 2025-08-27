import React from 'react'

const NotFound404 = () => {

    const myAnimStyle = {
        animationDuration: "1.5s",
        animationName: "slidein",
        animationIterationCount: "infinite",
        animationDirection: "alternate",
        animationTimingFunction: "ease-in-out",
        animationPlayState: "running",
        animationFillMode: "both",
    }

    return (
        <div style={{ height: "66vh", width: "100%" }} className="d-flex justify-content-center align-items-center">
            <div style={myAnimStyle} className="w-50 text-center">
                <h1 className="text-danger" style={{ fontSize: "10vw", fontWeight: "bolder" }}>
                    404
                </h1>
                <p style={{ fontSize: "2vw", fontWeight: "bolder", color: "#157A6E" }}>
                    This page is not found
                </p>
            </div>
        </div>
    )
}

export default NotFound404
