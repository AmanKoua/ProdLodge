import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import CSS from "csstype";

import AudioController from "./AudioController";
import AudioModuleContainer from "./AudioModuleContainer";
import {
  useInitAudioCtx,
  useFetchSongAndInitNodes,
  useReconnectNodes,
  usePlayAndResume,
  usePauseSong,
  useTrackSongTime,
  useInitVisualizer,
  useDraw,
} from "../webAudioHooks";

import tempSong from "../assets/kazukii.mp3";

console.log("AudioBox Rerender!");

// Audio context
let aCtx: AudioContext | undefined;
let setACtx: (val: any) => void;

// song buffer & song info
let songBuffer: AudioBuffer | undefined;
let setSongBuffer: (val: any) => void;
let songDuration: number;
let setSongDuration: (val: any) => void;

// AudioNodes (actual audio nodes)
let audioNodes: AudioNode[][] | undefined;
let setAudioNodes: (val: any) => void;
let audioNodesChanged: boolean;
let setAudioNodesChanged: (val: any) => void;

// audioModules (data required for creating UI for audio nodes)
let audioModulesData: Object[][];
let setAudioModulesData: (val: Object[][]) => void;

// Canvas and context
let canvas: HTMLCanvasElement | undefined;
let setCanvas: (val: any) => void;
let canvasCtx: CanvasRenderingContext2D | undefined;
let setCanvasCtx: (Val: any) => void;
let animationFrameHandler: number | undefined;
let setAnimationFrameHandler: (val: any) => void;
let canvasRef: any;

// Visualizer data and properties
let bufferLength: number | undefined;
let setBufferLength: (val: any) => void;
let dataArr: Uint8Array | undefined;
let setDataArr: (val: any) => void;

// Song information / time tracking
let songTime: number = 0;
let setSongTime: (val: number) => void;
let songTimeInterval: number | undefined;
let setSongTimeInterval: (val: any) => void;

// Page status
let hasUserGestured: boolean;
let setHasUserGestured: (val: boolean) => void;
let isVisualizing: boolean;
let setIsVisualizing: (val: boolean) => void;
let isPlaying: boolean;
let setIsPlaying: (val: boolean) => void;
let isExpanded: boolean;
let setIsExpanded: (val: boolean) => void;

let playSong = async function (seekTime: number | null) {
  setIsPlaying(true);
};

const stopSong = function () {
  setIsPlaying(false);
};

const startVisualizer = () => {
  if (!isVisualizing) {
    setIsVisualizing(true);
  }
};

const AudioBox = () => {
  let tempModuleData: Object[][] = [[{ type: "Blank" }]];
  canvasRef = useRef(null); // reference to canvas

  [isExpanded, setIsExpanded] = useState(false);
  [isVisualizing, setIsVisualizing] = useState(false);
  [isPlaying, setIsPlaying] = useState(false); // need to make these global!
  [audioModulesData, setAudioModulesData] = useState(tempModuleData); // Initial module will be the blank module
  [hasUserGestured, setHasUserGestured] = useState(false); // Keep track of first gesture required to initialize audioCtx

  [aCtx, setACtx] = useState(undefined); // aCtx and setACtx type are the way they are beause an audioCtx cannot be initialized on render.
  [songBuffer, setSongBuffer] = useState(undefined);
  [songDuration, setSongDuration] = useState(0);
  [audioNodes, setAudioNodes] = useState(undefined);
  [audioNodesChanged, setAudioNodesChanged] = useState(false);
  [dataArr, setDataArr] = useState(undefined);
  [songTime, setSongTime] = useState(0.0);
  [songTimeInterval, setSongTimeInterval] = useState(undefined);
  [canvas, setCanvas] = useState(undefined);
  [canvasCtx, setCanvasCtx] = useState(undefined);
  [animationFrameHandler, setAnimationFrameHandler] = useState(undefined);
  [bufferLength, setBufferLength] = useState(undefined);

  /////////////////////////////////// Web audio Api effects! ////////////////////////////////////////////////////

  useInitAudioCtx(hasUserGestured, setACtx);

  useFetchSongAndInitNodes(
    aCtx,
    tempSong,
    setSongBuffer,
    setSongDuration,
    setAudioNodes
  );

  useReconnectNodes(aCtx, audioNodes, audioNodesChanged, setAudioNodesChanged);

  usePlayAndResume(
    aCtx,
    audioNodes,
    songBuffer,
    isPlaying,
    songTime,
    setSongTime,
    setAudioNodes,
    setAudioNodesChanged
  );

  usePauseSong(isPlaying, audioNodes);

  useTrackSongTime(
    isPlaying,
    songTime,
    songTimeInterval,
    setSongTime,
    setSongTimeInterval
  );

  useInitVisualizer(
    isVisualizing,
    audioNodes,
    canvasRef,
    dataArr,
    setBufferLength,
    setDataArr,
    setCanvas,
    setCanvasCtx
  );

  useDraw(
    canvas,
    canvasCtx,
    audioNodes,
    dataArr,
    bufferLength,
    setAnimationFrameHandler
  );

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
    // used to assertain when user has 1st interacted with page (for audioContext creation)
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
          setSongTime={setSongTime}
          startVisualizer={startVisualizer}
        ></AudioController>
      </div>
    </>
  );
};

export default AudioBox;
