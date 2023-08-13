import { useState } from "react";
import { useRef } from "react";
import CSS from "csstype";

import AudioController from "./AudioController";
import AudioModuleContainer from "./AudioModuleContainer";

import tempSong from "../assets/kazukii.mp3";

console.log("AudioBox Rerender!");

// Fetch song globals
let aCTX: AudioContext;
let song;
let tempSongBuffer: ArrayBuffer;
let songBuffer: AudioBuffer;
let songDuration: number;

// Initialize buffer source globals
let source: AudioBufferSourceNode | undefined = undefined;

// Visualize globals
let analyser: AnalyserNode | undefined = undefined;
let bufferLength: number;
let dataArr: Uint8Array;
let prevDataArr: Uint8Array;
let canvas: HTMLCanvasElement;
let canvasCtx: CanvasRenderingContext2D;

// Canvas and song time variables
let canvasRef: any;
let animationFrameHandler: number | undefined = undefined;

// Props and state // Don't use state for local varaibles, becasuse this will cause a re-render
let isPlaying: boolean;
let setIsPlaying: (val: boolean) => void;
let songTime: number = 0;
let setSongTime: (val: number) => void;
let songTimeInterval: number;

let ctxInitialized: boolean;
let setCtxInitialized: (val: boolean) => void;
let visualizing: boolean;
let setIsVisualizing: (val: boolean) => void;

let audioModuleCount: number;
let setAudioModuleCount: (val: number) => void;
// let audioModuleContainerCounts: number[]; // keep track of the number of modules in each container
// let setAudioModuleContainerCounts: (val: number[]) => void;
let audioModulesData: Object[][];
let setAudioModulesData: (val: Object[][]) => void;

let fetchSong = async function () {
  // fetch song

  if (ctxInitialized) {
    // dont fetch the song multiple times
    return;
  }

  // Fetching song
  aCTX = new AudioContext(); // has to be created after a user gesture, AKA after pressing song start!

  song = await fetch(tempSong);
  tempSongBuffer = await song.arrayBuffer();

  await aCTX.decodeAudioData(tempSongBuffer, (decodedBuffer) => {
    songBuffer = decodedBuffer;
    songDuration = songBuffer.duration;
  });

  if (!ctxInitialized) {
    initializeBufferSource();
  }

  ctxInitialized = true;
};

let initializeBufferSource = function () {
  if (ctxInitialized) {
    return;
  }

  // Initializing buffer source
  if (source === undefined) {
    source = aCTX.createBufferSource();
  }

  // console.log("Initializing source");
  source.buffer = songBuffer;

  if (analyser === undefined) {
    analyser = aCTX.createAnalyser();
  }

  source.connect(analyser);
  source.connect(aCTX.destination);

  ctxInitialized = true;
};

let trackSongTime = function () {
  songTimeInterval = setInterval(() => {
    setSongTime(songTime + 0.1);
  }, 100);
};

let clearTrackSongTime = function () {
  clearInterval(songTimeInterval);
};

let playSong = async function (seekTime: number | null) {
  if (seekTime != null && seekTime < 0) {
    seekTime = 0;
  }

  if (!ctxInitialized) {
    await fetchSong();
    ctxInitialized = true;
  }

  if (source != undefined) {
    // disconnect, create new source, and connect to destination
    source.disconnect();
    source = aCTX.createBufferSource();
    source.buffer = songBuffer;
    source.connect(analyser!);
    analyser!.disconnect();
    source.connect(aCTX.destination);

    if (seekTime != null) {
      setSongTime(songDuration * seekTime);
    }

    source.start(0, songTime);
    cancelAnimationFrame(animationFrameHandler!);
    animationFrameHandler = requestAnimationFrame(draw);
    clearTrackSongTime();
    trackSongTime();
  } else {
    source = aCTX.createBufferSource();
    source.buffer = songBuffer;
    source.connect(analyser!);
    analyser!.disconnect();
    source.connect(aCTX.destination);

    if (seekTime != null) {
      setSongTime(songDuration * seekTime);
    }

    source.start(0, songTime);
    cancelAnimationFrame(animationFrameHandler!);
    animationFrameHandler = requestAnimationFrame(draw);
    clearTrackSongTime();
    trackSongTime();
  }
};

const stopSong = function () {
  if (source != undefined) {
    if (animationFrameHandler != undefined) {
      cancelAnimationFrame(animationFrameHandler);
      animationFrameHandler = undefined;
    }

    source.stop();
    clearTrackSongTime();
  }
};

const visualize = function () {
  if (analyser === undefined) {
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
};

const startVisualizer = () => {
  if (!visualizing) {
    visualize();
    visualizing = true;
  }
};

function draw() {
  animationFrameHandler = requestAnimationFrame(draw);
  analyser!.getByteTimeDomainData(dataArr);

  canvasCtx.fillStyle = "rgb(255, 255, 255)";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 1;
  canvasCtx.strokeStyle = "rgb(0, 0, 0)";

  // oscilloscope
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

  /*
    // Line visualizer
	canvasCtx.beginPath();

	const sliceWidth = ((canvas.width * 1.0) / bufferLength);
	let x = 0;

    if(prevDataArr == undefined){
        console.log("redefined");
        prevDataArr = new Uint8Array(dataArr.length);
        prevDataArr = dataArr;
    }

	for (let i = 0; i < bufferLength; i++) {
		const v = dataArr[i] / 128.0;
        const vPrev = prevDataArr[i] / 128.0;
		const y = (v * canvas.height);
        const yPrev = (vPrev * canvas.height);
        const yDelta = (y - yPrev);
        const newY = y - (yDelta);

        canvasCtx.moveTo(x, canvas.height);
        canvasCtx.lineTo(x, canvas.height - newY); // greater values reach farther down.

        prevDataArr[i] = newY * 128.0;
		x += sliceWidth;
	}

	canvasCtx.stroke();
    // prevDataArr = Uint8Array.from(dataArr);
    */
}

const AudioBox = () => {
  let tempModuleData: Object[][] = [[{ type: "Blank" }]];

  const [isExpanded, setIsExpanded] = useState(false);
  [visualizing, setIsVisualizing] = useState(false);
  [isPlaying, setIsPlaying] = useState(false); // need to make these global!
  [songTime, setSongTime] = useState(0.0);
  [audioModuleCount, setAudioModuleCount] = useState(1);
  // [audioModuleContainerCounts, setAudioModuleContainerCounts] = useState([1]);
  [audioModulesData, setAudioModulesData] = useState(tempModuleData); // Initial module will be the blank module

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
    overflow: "hidden",
  };

  //   AudioBoxStyle.height = isExpanded ? "465px" : "40px";
  AudioBoxStyle.height = isExpanded
    ? `${audioModulesData.length * 255}px`
    : "40px";

  const CanvasStyle: CSS.Properties = {
    position: "absolute",
    bottom: "0px",
    width: "100%",
    height: "40px",
  };

  const ModuleContainerStyle: CSS.Properties = {
    margin: "1%",
    display: "flex",
    justifyContent: "left",
    width: "98%",
    height: "200px",
    backgroundColor: "#3d8bf2",
    opacity: "75%",
  };

  const addModule = (): void => {
    let tempAudioModulesData: Object[][] = audioModulesData;

    if (tempAudioModulesData[tempAudioModulesData.length - 1].length < 3) {
      // if last arr is holding less than 3 modules
      tempAudioModulesData[tempAudioModulesData.length - 1].push({
        type: "New",
      });
    } else {
      tempAudioModulesData.push([{ type: "New" }]);
    }

    setAudioModulesData(tempAudioModulesData);

    // console.log(tempAudioModulesData);
  };

  const setModuleType = (type: string, index: number[]): void => {
    // yet to be implemented
  };

  const generateAudioSettingsFragment = (): JSX.Element => {
    let audioSettingsFragment: JSX.Element;

    audioSettingsFragment = (
      <>
        {audioModulesData.map((item, idx) => {
          return (
            <AudioModuleContainer
              containerIndex={idx}
              modules={item}
              key={idx}
              addModule={addModule}
              setModuleType={setModuleType}
            ></AudioModuleContainer>
          );
        })}
      </>
    );

    return audioSettingsFragment;
  };

  return (
    <>
      <div style={AudioBoxStyle}>
        {generateAudioSettingsFragment()}
        <canvas style={CanvasStyle} ref={canvasRef}></canvas>
        <AudioController
          isPlaying={isPlaying}
          isExpanded={isExpanded}
          songTime={songTime}
          songDuration={songDuration}
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
