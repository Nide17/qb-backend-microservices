import React, { Component } from 'react'

class GridMultiplex extends Component {

    googleInit = null

    componentDidMount() {

        this.googleInit = setTimeout(() => {
            if (typeof window !== 'undefined')
                (window.adsbygoogle = window.adsbygoogle || []).push({})
        }, 400)
    }

    componentWillUnmount() {
        if (this.googleInit) clearTimeout(this.googleInit)
    }

    render() {
        return (
            <ins
                className="adsbygoogle"
                style={{ display: "block", maxWidth: "100%", margin: "0 auto", textAlign: "center",  overflowX: "hidden", overflowY: "hidden", overflow: "hidden", overflowWrap: "normal", whiteSpace: "nowrap" }}
                data-ad-format="autorelaxed"
                data-ad-client="ca-pub-8918850949540829"
                data-ad-slot="9064066298"></ins>)
    }
}

export default GridMultiplex