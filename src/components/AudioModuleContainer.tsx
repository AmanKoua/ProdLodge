import React from 'react';
import BlankAudioModule from './BlankAudioModule';
import CSS from "csstype";

interface Props{
    moduleCount: number;
    modules: any[]; // pass in data required to reconstruct module interfaces
}

const AudioModuleContainer = ({moduleCount, modules}: Props) => {

    const AudioModuleContainerStyle: CSS.Properties = {
        margin: "1%",
        display: "flex",
        justifyContent: "left",
        width: "98%",
        height: "200px",
        backgroundColor: "#3d8bf2",
        opacity: "75%",
    }

    const generateAudioModulesFragment = (): JSX.Element =>{

        let audioModulesFragment : JSX.Element;

        let tempArr : boolean[] = new Array(moduleCount); // array needed to map over elements in TSX
        tempArr.fill(true);

        audioModulesFragment = 
        (
            <>
                {tempArr.map((temp, idx)=>{
                    return <BlankAudioModule key={idx}></BlankAudioModule>
                })}
            </>
        );

        return audioModulesFragment;

    }

    return (
        <>
            <div style={AudioModuleContainerStyle}>
                {generateAudioModulesFragment()}
                {/* <BlankAudioModule></BlankAudioModule> */}
            </div>
        </>
    )
}

export default AudioModuleContainer