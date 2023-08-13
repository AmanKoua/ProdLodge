import React from 'react';
import BlankAudioModule from './BlankAudioModule';
import CSS from "csstype";

const AudioModuleContainer = () => {

    const AudioModuleContainerStyle: CSS.Properties = {
        margin: "1%",
        display: "flex",
        justifyContent: "left",
        width: "98%",
        height: "200px",
        // backgroundColor: "#3d8bf2",
        opacity: "75%",
    }

    return (
        <>
            <div style={AudioModuleContainerStyle}>
                <BlankAudioModule></BlankAudioModule>
                <BlankAudioModule></BlankAudioModule>
                <BlankAudioModule></BlankAudioModule>
            </div>
        </>
    )
}

export default AudioModuleContainer