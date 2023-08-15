import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import CSS from "csstype";

import AudioController from "./AudioController";
import AudioModuleContainer from "./AudioModuleContainer";

import tempSong from "../assets/kazukii.mp3";

console.log("AudioBox Rerender!");

// Fetch song globals
let aCtx: AudioContext | undefined;
let setACtx: (val: any) => void;
let song: any;
let setSong: (val: any) => void;
let tempSongBuffer: ArrayBuffer;
let setTempSongBuffer: (val: any) => void;
let songBuffer: AudioBuffer | undefined;
let setSongBuffer: (val: any) => void;
let songDuration: number;
let setSongDuration: (val: any) => void;

// Initialize buffer source globals
let source: AudioBufferSourceNode | undefined = undefined;
let setSource: (val: any) => void;
let analyser: AnalyserNode | undefined = undefined;
let setAnalyser: (val: any) => void;
let audioNodes: AudioNode[][] | undefined;
let setAudioNodes: (val: any) => void;
let audioNodesChanged: boolean;
let setAudioNodesChanged: (val: any) => void;

// Visualize globals
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

let hasUserGestured: boolean;
let setHasUserGestured: (val: boolean) => void;

let ctxInitialized: boolean;
let setCtxInitialized: (val: boolean) => void;
let visualizing: boolean;
let setIsVisualizing: (val: boolean) => void;

let audioModulesData: Object[][];
let setAudioModulesData: (val: Object[][]) => void;

let fetchSong = async function () {
  // fetch song

  if (ctxInitialized) {
    // dont fetch the song multiple times
    return;
  }

  // Fetching song
  aCtx = new AudioContext(); // has to be created after a user gesture, AKA after pressing song start!

  song = await fetch(tempSong);
  tempSongBuffer = await song.arrayBuffer();

  await aCtx.decodeAudioData(tempSongBuffer, (decodedBuffer) => {
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
    source = aCtx!.createBufferSource();
  }

  // console.log("Initializing source");
  source.buffer = songBuffer!;

  if (analyser === undefined) {
    analyser = aCtx!.createAnalyser();
  }

  // source.connect(analyser);
  // source.connect(aCtx!.destination);

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
  setIsPlaying(!isPlaying);
  return;

  // TODO : Testing playing effect!

  if (seekTime != null && seekTime < 0) {
    seekTime = 0;
  }

  if (seekTime != null) {
    setSongTime(songDuration * seekTime);
  }

  audioNodes![0][0].start(0, songTime);

  cancelAnimationFrame(animationFrameHandler!);
  animationFrameHandler = requestAnimationFrame(draw); // TODO : Refactor canvas!
  clearTrackSongTime();
  trackSongTime();
};

const stopSong = function () {
  if (source != undefined) {
    if (animationFrameHandler != undefined) {
      cancelAnimationFrame(animationFrameHandler);
      animationFrameHandler = undefined;
    }

    // source.stop();
    audioNodes![0][0].stop();
    clearTrackSongTime();
  }
};

const startVisualizer = () => {
  /* 
    Todo : refactor as an effect
  */
  if (!visualizing) {
    visualize();
    visualizing = true;
  }
};

const visualize = function () {
  if (analyser === undefined) {
    // analyser = aCtx!.createAnalyser();
    // source!.connect(analyser);
  }

  // analyser.fftSize = 2048;

  // bufferLength = analyser.frequencyBinCount;
  // dataArr = new Uint8Array(bufferLength);
  // analyser.getByteTimeDomainData(dataArr);

  // Get a canvas defined with ID "oscilloscope"
  canvas = canvasRef.current!;
  canvasCtx = canvas.getContext("2d")!;

  // draw an oscilloscope of the current audio source
  // draw();
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
}

const AudioBox = () => {
  let tempModuleData: Object[][] = [[{ type: "Blank" }]];

  const [isExpanded, setIsExpanded] = useState(false);
  [visualizing, setIsVisualizing] = useState(false);
  [isPlaying, setIsPlaying] = useState(false); // need to make these global!
  [songTime, setSongTime] = useState(0.0);
  [audioModulesData, setAudioModulesData] = useState(tempModuleData); // Initial module will be the blank module
  [hasUserGestured, setHasUserGestured] = useState(false); // Keep track of first gesture required to initialize audioCtx

  [aCtx, setACtx] = useState(undefined); // aCtx and setACtx type are the way they are beause an audioCtx cannot be initialized on render.
  [songBuffer, setSongBuffer] = useState(undefined);
  [songDuration, setSongDuration] = useState(0);
  [source, setSource] = useState(undefined);
  [audioNodes, setAudioNodes] = useState(undefined);
  [audioNodesChanged, setAudioNodesChanged] = useState(false);

  canvasRef = useRef(null); // provides direct access to DOM

  /////////////////////////////////// Web audio Api effects! ////////////////////////////////////////////////////

  useEffect(() => {
    // initialze audio context on first gesture
    if (!hasUserGestured) {
      return;
    }

    console.log("audio context init!");
    setACtx(new AudioContext());
  }, [hasUserGestured]);

  useEffect(() => {
    // Fetch song data and initialize primary nodes
    if (aCtx === undefined) {
      return;
    }

    console.log("fetching song!!!!");

    let song;
    let tempSongBuffer;

    let fetchSong = async () => {
      // Fetch song store songBuffer and songDuration as state
      song = await fetch(tempSong);
      tempSongBuffer = await song.arrayBuffer();

      await aCtx!.decodeAudioData(tempSongBuffer, async (decodedBuffer) => {
        setSongBuffer(decodedBuffer);
        setSongDuration(decodedBuffer.duration);
        await createPrimaryNodes(decodedBuffer);
      });
    };

    let createPrimaryNodes = async (songBuffer: AudioBuffer) => {
      // create audioBufferSourceNode and analyserNode
      console.log("creating primary nodes!");
      let tempAudioSourceNode: AudioBufferSourceNode =
        aCtx!.createBufferSource();
      let tempAnalyserNode: AnalyserNode = aCtx!.createAnalyser();

      tempAudioSourceNode.buffer = songBuffer;

      let tempAudioNodesArr: AudioNode[][] = [
        [tempAudioSourceNode],
        [tempAnalyserNode],
      ];

      setAudioNodes(tempAudioNodesArr);
    };

    fetchSong();
  }, [aCtx]);

  useEffect(() => {
    // disconnect and reconnect all audioNodes
    if (audioNodes === undefined) {
      return;
    }

    if (!audioNodesChanged) {
      return;
    }

    console.log("connecting nodes!");

    if (audioNodes.length == 2) {
      audioNodes[0][0].connect(aCtx!.destination); // connect to destination
      audioNodes[0][0].connect(audioNodes[1][0]); // connect to analyser
      // audioNodes[0][0].start(0, 100);
    } else {
      // TODO : Implement here!
      // loop through audioNodes and connect them one by one
      // last one connects to dest any analyser.
    }

    setAudioNodesChanged(false);

    return () => {
      // cleanup function disconnects all audio nodes
      if (audioNodes === undefined) {
        return;
      }
      if (!audioNodesChanged) {
        return;
      }

      for (let i = 0; i < audioNodes.length; i++) {
        for (let j = 0; j < audioNodes[i].length; j++) {
          audioNodes[i][j].disconnect();
        }
      }
    };
  }, [audioNodes, audioNodesChanged]);

  useEffect(() => {
    // Play (resume (requires recreation of source node))
    if (!isPlaying) {
      return;
    }

    if (aCtx === undefined) {
      return;
    }

    // audioNodes![0][0].start(0, 100);

    console.log("play / resume!");

    let tempAudioNodes = audioNodes; // I suspect that this is NOT seen as a different array upon mutation because the reference is the same
    let tempAudioSourceNode: AudioBufferSourceNode = aCtx!.createBufferSource();

    tempAudioSourceNode.buffer = songBuffer!;
    tempAudioNodes![0][0] = tempAudioSourceNode;

    setAudioNodes(tempAudioNodes);
    setAudioNodesChanged(true);

    console.log(audioNodes);
    audioNodes![0][0].connect(aCtx.destination);
    audioNodes![0][0].start(0, 100);
    console.log("STARTED PLAYING!");

    // setTimeout(() => {
    //   setAudioNodesChanged(true);
    // }, 3000);

    // setTimeout(() => {
    //   console.log(audioNodes);
    //   audioNodes![0][0].start(0, 100);
    //   console.log("STARTED PLAYING!");
    // }, 1000);
  }, [isPlaying]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  const handleUserGesture = (): void => {
    if (!hasUserGestured) {
      setHasUserGestured(true);
    } else {
      // ignore if already true.
      return;
    }
  };

  /*
    Adds a modul to the audioModulesData. This variable
    is for storing information regarding the displayed
    cards. it is NOT for storing individual audio nodes
  */
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

  /*
    New node will be able to select it's type and it will 
    switch to that type of module (and create the corresponding
    audio node)
  */
  const setModuleType = (type: string, index: number[]): void => {
    // yet to be implemented
  };

  /*
    Generate the UI for audio modules that are displayed
  */
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
      <div style={AudioBoxStyle} onClick={handleUserGesture}>
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
