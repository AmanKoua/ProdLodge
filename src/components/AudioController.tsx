import CSS from "csstype";
import playButton from "../assets/playButton.png";
import pauseButton from "../assets/pauseButton.png";
import {useRef} from 'react';

interface Props{
    isPlaying: boolean;
    isExpanded: boolean;
    setIsPlaying: (val : boolean) => void;
    setIsExpanded: (val: boolean) => void;
    playSong: () => void;
    stopSong: () => void;
    startVisualizer: () => void;
}

const AudioController = ({isPlaying, isExpanded, setIsPlaying, setIsExpanded, playSong, stopSong, startVisualizer}: Props) => {

    const audioControllerRef = useRef(null);

    audioControllerRef.current

    const AudioControllerStyle: CSS.Properties = {
        position: "absolute",
        bottom:"0px",
        width: "100%",
        height: "40px",
        border: "1px solid black",
        // zIndex: -1,
    };

    const imgStyle: CSS.Properties = {
        width: "30px",
        marginTop: "5px",
        marginLeft: "5px",
    };

    const ExpandButtonStyle: CSS.Properties = {
        position:"absolute",
        marginLeft: "45%",
        width: "10%",
        height: "15px",
        border: "1px solid black",
        fontSize: "10px",
        textAlign: "center",
        backgroundColor: "lavender",
        opacity: "75%",
    };

    const handleImageClick = async () =>{
        if(!isPlaying){
            await playSong();
        }
        else{
            stopSong();
            startVisualizer();
        }
        setIsPlaying(!isPlaying);
        startVisualizer();
    }

    const imgSrc = isPlaying ? pauseButton : playButton;
    const expansionText = isExpanded ? "Close" : "Open";

    return (
        <>
        <div style={AudioControllerStyle} ref={audioControllerRef}>
            <div style={ExpandButtonStyle} onClick={()=>{setIsExpanded(!isExpanded)}}>
                {expansionText}
            </div>
            <img src={imgSrc} style={imgStyle} onClick={handleImageClick} />
        </div>
        </>
    );
};

export default AudioController;
