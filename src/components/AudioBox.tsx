import { useState } from "react";
import {useRef} from "react";

import AudioController from "./AudioController";
import CSS from "csstype";
import tempSong from '../assets/kazukii.mp3';

// Fetch song globals
let aCTX : AudioContext;
let song;
let tempSongBuffer : ArrayBuffer;
let songBuffer : AudioBuffer;

// Initialize buffer source globals
let source : AudioBufferSourceNode | undefined = undefined;

// Visualize globals
let analyser : AnalyserNode | undefined = undefined;
let bufferLength : number;
let dataArr: Uint8Array;
let canvas: HTMLCanvasElement;
let canvasCtx: CanvasRenderingContext2D ;

// Canvas and song time variables
let canvasRef: any;
let animationFrameHandler: number | undefined = undefined;
let songTime: number = 0;

// Props and state
let isPlaying: boolean;
let setIsPlaying: (val: boolean) => void;
let ctxInitialized: boolean;
let setCtxInitialized: (val : boolean) => void;
let songTimeInterval: number;
let visualizing: boolean;
let setIsVisualizing: (val: boolean) => void;

let fetchSong = async function(){ // fetch song 

    if(ctxInitialized){ // dont fetch the song multiple times
        return;
    }

    ctxInitialized = true;

    // Fetching song
    aCTX = new AudioContext(); // has to be created after a user gesture, AKA after pressing song start!

    song = await fetch(tempSong);
    tempSongBuffer = await song.arrayBuffer();

    await aCTX.decodeAudioData(tempSongBuffer, (decodedBuffer) => {
        songBuffer = decodedBuffer;
    })

    initializeBufferSource();

}

let initializeBufferSource = function(){
    // Initializing buffer source
    if(source === undefined){
        source = aCTX.createBufferSource();
    }

    // console.log("Initializing source");
    source.buffer = songBuffer;

    if(analyser === undefined){
        analyser = aCTX.createAnalyser();
    }

    source.connect(analyser);
    source.connect(aCTX.destination);
}

let trackSongTime = function(){
    songTimeInterval = setInterval(()=>{
        songTime += 0.1;
    }, 100);
}

let clearTrackSongTime = function(){
    clearInterval(songTimeInterval);
}

let playSong = async function(){
    if(!ctxInitialized){
        await fetchSong();
        setCtxInitialized(true);
    }

    if(source != undefined){ // disconnect, create new source, and connect to destination
        source.disconnect();
        source = aCTX.createBufferSource();
        source.buffer = songBuffer;
        source.connect(analyser!);
        source.connect(aCTX.destination);
        source.start(0, songTime);
        animationFrameHandler = requestAnimationFrame(draw);
        trackSongTime();    
    }
}

const stopSong = function(){
    if(source != undefined){

        if(animationFrameHandler != undefined){
            cancelAnimationFrame(animationFrameHandler);
            animationFrameHandler = undefined;
        }

        source.stop();   
        clearTrackSongTime()
    }
}

const visualize = function(){

    if(analyser === undefined){
        analyser = aCTX.createAnalyser();
        source!.connect(analyser);
    }

    analyser.fftSize = 2048;

    bufferLength = analyser.frequencyBinCount;
    dataArr = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArr);

    // Get a canvas defined with ID "oscilloscope"
    canvas = canvasRef.current!;
    canvasCtx = canvas.getContext("2d")!;

    // draw an oscilloscope of the current audio source
    draw();
}

const startVisualizer = ()=>{
    if(!visualizing){
        visualize();
        setIsVisualizing(true);
    }
}

function draw() {

    // console.log("DRAWING BOIO!");

	animationFrameHandler = requestAnimationFrame(draw);    
	analyser!.getByteTimeDomainData(dataArr);

	canvasCtx.fillStyle = "rgb(255, 255, 255)";
	canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

	canvasCtx.lineWidth = 2;
	canvasCtx.strokeStyle = "rgb(0, 0, 0)";

	canvasCtx.beginPath();

	const sliceWidth = (canvas.width * 1.0) / bufferLength;
	let x = 0;

	for (let i = 0; i < bufferLength; i++) {
		const v = dataArr[i] / 128.0;
		const y = (v * canvas.height) / 2;

		if (i === 0) {
		canvasCtx.moveTo(x, y);
		} else {
		canvasCtx.lineTo(x, y);
		}

		x += sliceWidth;
	}

	canvasCtx.lineTo(canvas.width, canvas.height / 2);
	canvasCtx.stroke();
}

const AudioBox = () => {

    const [isExpanded, setIsExpanded] = useState(false);
    [visualizing, setIsVisualizing] = useState(false);
    [isPlaying, setIsPlaying] = useState(false); // need to make these global!
    [ctxInitialized, setCtxInitialized] = useState(false);
    canvasRef = useRef(null); // provides direct access to DOM

    const AudioBoxStyle: CSS.Properties = {
        position: "relative",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "10%",
        width: "50%",
        height: "300px",
        border: "1px solid black",
        transition: "all 0.3s",
    };

    AudioBoxStyle.height = isExpanded ? "300px" : "40px";

    const CanvasStyle: CSS.Properties = {
        position: "absolute",
        bottom:"0px",
        width: "100%",
        height: "40px",
    };

    return (
    <>
        <div style={AudioBoxStyle}>
            <canvas style={CanvasStyle} ref={canvasRef}></canvas>
            <AudioController
                isPlaying={isPlaying}
                isExpanded={isExpanded}
                setIsPlaying={setIsPlaying}
                setIsExpanded={setIsExpanded}
                playSong={playSong}
                stopSong={stopSong}
                startVisualizer={startVisualizer}
            ></AudioController>
        </div>
    </>
    );

};

export default AudioBox;
