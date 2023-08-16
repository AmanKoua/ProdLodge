import { useState } from "react";
import { useRef } from "react";
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
  useInitCanvas,
  useDraw,
} from "../webAudioHooks";

import tempSong from "../assets/songs/myRemix.mp3";

console.log("AudioBox Rerender!");

// Audio context
let aCtx: AudioContext | undefined;
let setACtx: (val: any) => void;

// song buffer & song info
let songBuffer: AudioBuffer | undefined;
let setSongBuffer: (val: any) => void;
let impulseBuffer: AudioBuffer | undefined;
let setImpulseBuffer: (val: any) => void;
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
let areAudioNodesReady: boolean;
let setAreAudioNodesReady: (val: boolean) => void;
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
  [hasUserGestured, setHasUserGestured] = useState(false); // Keep track of first gesture required to initialize audioCtx

  [audioModulesData, setAudioModulesData] = useState(tempModuleData); // Initial module will be the blank module
  [areAudioNodesReady, setAreAudioNodesReady] = useState(false);

  [aCtx, setACtx] = useState(undefined); // aCtx and setACtx type are the way they are beause an audioCtx cannot be initialized on render.
  [songBuffer, setSongBuffer] = useState(undefined);
  [impulseBuffer, setImpulseBuffer] = useState(undefined);
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
    setImpulseBuffer,
    setSongBuffer,
    setSongDuration,
    setAudioNodes,
    setAreAudioNodesReady
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

  useInitCanvas(canvasRef);

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
      // wait for audioCtx to initialize before setting to true!
      setHasUserGestured(true);
    } else {
      // ignore if already true.
      return;
    }
  };

  /*
    Adds a module to the audioModulesData. This variable
    is for storing information regarding the displayed
    cards. it is NOT for storing individual audio nodes
  */
  const addModule = (): void => {
    let tempAudioModulesData: Object[][] = audioModulesData;

    // If last module is already a new module, dont allow for further module addition (until module type is created)

    let lastIndex = tempAudioModulesData.length - 1;

    if (
      // if last module is new module (unspecified), dont add another one
      tempAudioModulesData[lastIndex][
        tempAudioModulesData[lastIndex].length - 1
      ].type === "New"
    ) {
      return;
    }

    lastIndex = tempAudioModulesData.length - 1;

    if (tempAudioModulesData[lastIndex].length < 3) {
      // if last arr is holding less than 3 modules
      tempAudioModulesData[lastIndex].push({
        type: "New",
      });
    } else {
      tempAudioModulesData.push([{ type: "New" }]);
    }

    // console.log(tempAudioModulesData);

    setAudioModulesData(tempAudioModulesData);
  };

  const addAudioNode = (data: Object) => {
    // add the audioNode to process audio data (2nd subarray only allows 2 audioNodes to synchronize with audioModules)

    if (audioNodes === undefined) {
      console.log("cannot add node to undefined audio nodes");
      return;
    }

    const insertNode = (
      tempAudioNodes: AudioNode[][] | undefined,
      tempAudioNode: AudioNode
    ) => {
      // splice into appropriate position
      for (let i = 1; i < tempAudioNodes!.length - 1; i++) {
        if (i === tempAudioNodes!.length - 2) {
          // if on last sub-array and still not inserted

          if (i === 1) {
            // If on 1st array that is not reserved for audioBufferSourceNode
            if (tempAudioNodes![tempAudioNodes!.length - 2].length < 2) {
              tempAudioNodes![tempAudioNodes!.length - 2].push(tempAudioNode);
              break;
            } else {
              tempAudioNodes!.splice(tempAudioNodes!.length - 1, 0, []);
              tempAudioNodes![tempAudioNodes!.length - 2].push(tempAudioNode);
              break;
            }
          } else {
            if (tempAudioNodes![tempAudioNodes!.length - 2].length < 3) {
              tempAudioNodes![tempAudioNodes!.length - 2].push(tempAudioNode);
              break;
            } else {
              tempAudioNodes!.splice(tempAudioNodes!.length - 1, 0, []);
              tempAudioNodes![tempAudioNodes!.length - 2].push(tempAudioNode);
              break;
            }
          }
        }

        if (i === 1) {
          // If on 1st array that is not reserved for audioBufferSourceNode
          if (tempAudioNodes![i].length < 2) {
            // insert an audioNodeHere
            tempAudioNodes![i].push(tempAudioNode!);
            break;
          } else {
            continue;
          }
        } else {
          if (tempAudioNodes![i].length < 3) {
            // insert an audioNodeHere
            tempAudioNodes![i].push(tempAudioNode!);
            break;
          } else {
            continue;
          }
        }
      }
      // console.log(tempAudioNodes);
      return tempAudioNodes;
    };

    let tempAudioNodes = audioNodes;

    if (audioNodes!.length === 2) {
      // if only audioBufferSource and analyser, create empty array for extra nodes
      tempAudioNodes?.splice(1, 0, []);
      // console.log(tempAudioNodes);
    }

    let tempAudioNode: AudioNode;

    switch (
      data.type // crete audioNode based on module Object type and information
    ) {
      case "Highpass":
        tempAudioNode = aCtx!.createBiquadFilter();
        tempAudioNode.type = "highpass";
        tempAudioNode.frequency.value = 300;
        insertNode(tempAudioNodes, tempAudioNode);
        setAudioNodes(tempAudioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      case "Lowpass":
        tempAudioNode = aCtx!.createBiquadFilter();
        tempAudioNode.type = "lowpass";
        tempAudioNode.frequency.value = 1000;
        insertNode(tempAudioNodes, tempAudioNode);
        setAudioNodes(tempAudioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      case "Reverb":
        tempAudioNode = aCtx!.createConvolver();
        tempAudioNode.buffer = impulseBuffer;
        insertNode(tempAudioNodes, tempAudioNode);
        setAudioNodes(tempAudioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
    }
  };

  const editAudioNodeData = (data: Object, moduleIndex: number[]) => {
    let tempAudioNodes = audioNodes;

    let row = moduleIndex[0] + 1;
    let column = moduleIndex[1];

    if (row === 1) {
      column -= 1;
    }

    // console.log(tempAudioNodes![moduleIndex[0] + 1][moduleIndex[1]]);
    // console.log(tempAudioNodes, row, column);

    tempAudioNodes![row][column].frequency.value = data.frequency;

    setAudioNodes(tempAudioNodes);

    // data object contains configuration information for a given audioNode
    // moduleIndex [row, column] contains the index of the audioModule whose data is being changed.
  };

  /*
    New node will be able to select it's type and it will 
    switch to that type of module (and create the corresponding
    audio node)
  */
  const setModuleType = (type: string, moduleIndex: number[]): void => {
    let tempAudioModulesData: Object[][] = audioModulesData;
    tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].type = type;

    if (type === "Highpass") {
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].frequency = 300;
    } else if (type === "Lowpass") {
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].frequency = 1000;
    }

    addAudioNode(tempAudioModulesData[moduleIndex[0]][moduleIndex[1]]);
    setAudioModulesData(tempAudioModulesData);

    // console.log(audioModulesData, audioNodes);
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
              editAudioNodeData={editAudioNodeData}
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
          hasUserGestured={hasUserGestured}
          isPlaying={isPlaying}
          isExpanded={isExpanded}
          songTime={songTime}
          songDuration={songDuration}
          areAudioNodesReady={areAudioNodesReady}
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
