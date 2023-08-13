import React from 'react'
import CSS from "csstype";

const BlankAudioModule = () => {

    const BlankAudioModuleStyle : CSS.Properties = {
        position: "relative",
        marginTop: "1%",
        marginLeft: "2.5%",
        width: "30%",
        height: "185px",
        border: "1px solid black",
        borderRadius: "10px",
        backgroundColor: "red",
        opacity: "75%",
    }

    return (
        <div style={BlankAudioModuleStyle}>Audio Module</div>
    )
}

export default BlankAudioModule