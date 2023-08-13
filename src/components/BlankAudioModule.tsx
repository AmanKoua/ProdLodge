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
        // backgroundColor: "green",
        opacity: "100%",
    }

    const AddButtonStyle : CSS.Properties = {
        position: "absolute",
        marginTop: "0%",
        marginLeft: "36%",
        width: "28%",
        height: "25%",
    }

    const AddModuleTextStyle : CSS.Properties = {
        fontSize: "20px",
        width: "60%",
        marginLeft: "20%",
        marginTop: "10%",
        textAlign: "center",
        // backgroundColor: "green",
    }

    const CenterDivStyle : CSS.Properties = {
        position: "absolute",
        marginLeft: "25%",
        marginTop: "15%",
        alignContent: "center",
        width: "50%",
        height: "70%",
        // backgroundColor: "blue",
        opacity: "80%",
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