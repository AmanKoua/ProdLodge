import React from 'react'
import CSS from "csstype";
import addButton from "../assets/addModule1.png";

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
        opacity: "100%",
    }

    const AddButtonStyle : CSS.Properties = {
        position: "absolute",
        marginTop: "30%",
        marginLeft: "36%",
        width: "25%",
        height: "25%",
    }

    const AddModuleTextStyle : CSS.Properties = {
        fontSize: "20px",
    }

    const CenterDivStyle : CSS.Properties = {
        position: "absolute",
        marginLeft: "12.5%",
        width: "75%",
        height: "100%",
        backgroundColor: "black",
        zIndex: "50",
    }

    return (
        <div style={BlankAudioModuleStyle}>
            <div style={CenterDivStyle}>
                <h1 style={AddModuleTextStyle}>Add Module</h1>
                <img src={addButton} style={AddButtonStyle}></img>
            </div>
        </div>
    )
}

export default BlankAudioModule