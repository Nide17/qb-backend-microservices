import React, { Component } from 'react'

class SideResizable extends Component {

    componentDidMount() {
        setTimeout(function () { (window.adsbygoogle = window.adsbygoogle || []).push({}) }, 400);
    }

    render() {
        return (
            <ins
                className="adsbygoogle"
                style={{ display: "block", maxWidth: "100%", margin: "0 auto", textAlign: "center", overflowX: "hidden", overflowY: "hidden", overflow: "hidden", overflowWrap: "normal", whiteSpace: "nowrap" }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="ca-pub-8918850949540829"
                data-ad-slot="1555195647"></ins>)
    }
}

export default SideResizable