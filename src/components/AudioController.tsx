import CSS from "csstype";
import playButton from "../assets/playButton.png";
import pauseButton from "../assets/pauseButton.png";
import {useRef} from 'react';
import {useEffect} from 'react';

let audioControllerElement : HTMLDivElement;
let audioControllerRef : any;
let eventListenerAttached : boolean = false;

let audioControlImageElement : HTMLImageElement;
let audioControlImageRef : any;

interface Props{
    isPlaying: boolean;
    isExpanded: boolean;
    setIsPlaying: (val : boolean) => void;
    setIsExpanded: (val: boolean) => void;
    playSong: (val : number | null) => void;
    stopSong: () => void;
    startVisualizer: () => void;
}

const AudioController = ({isPlaying, isExpanded, setIsPlaying, setIsExpanded, playSong, stopSong, startVisualizer}: Props) => {

    audioControllerRef = useRef<HTMLDivElement | null>(null);
    audioControllerElement = audioControllerRef.current;

    useEffect(()=> { // attach eventHandler to AudioControllerDiv
        const handleAudioControllerClick = async (event : MouseEvent) => {
            // console.log(event.target);
            if(event.target === audioControllerRef.current){
                let x = event.clientX;
                let left = audioControllerElement.getBoundingClientRect().left;
                let right = audioControllerElement.getBoundingClientRect().right;
                let width = right-left;
                let position = ((x-left) / width); // position percentage

                // console.log(position);
                await playSong(position);
                setIsPlaying(true);

            }
            else{

            }
        }

        if(audioControllerRef.current){
            audioControllerRef.current.addEventListener("click", handleAudioControllerClick);
        }

    }, []);

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
        zIndex : "5",
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
            await playSong(null);
        }
        else{
            stopSong();
            // startVisualizer();
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
            <img ref={audioControlImageRef} src={imgSrc} style={imgStyle} onClick={handleImageClick} />
        </div>
        </>
    );

};

export default AudioController;
