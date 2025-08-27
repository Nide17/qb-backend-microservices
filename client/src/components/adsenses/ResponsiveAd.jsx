import React, { Component } from 'react'

class ResponsiveAd extends Component {

    // 
    componentDidMount() {
        setTimeout(function () { (window.adsbygoogle = window.adsbygoogle || []).push({}) }, 400);
    }

    render() {
        return (
            <ins
                className="adsbygoogle"
                style={{ display: "block", maxWidth: "100%", margin: "0 auto", textAlign: "center",  overflowX: "hidden", overflowY: "hidden", overflow: "hidden", overflowWrap: "normal", whiteSpace: "nowrap" }}
                data-ad-client="ca-pub-8918850949540829"
                data-ad-slot="9642045284"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>)
    }
}

export default ResponsiveAd