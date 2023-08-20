import { useState } from "react";
import { useRef } from "react";
import CSS from "csstype";

import AudioController from "./AudioController";
import AudioModuleContainer from "./AudioModuleContainer";
import AudioSettingsDrawer from "./AudioSettingsDrawer";

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

import tempSong from "../assets/songs/telepathy.mp3";

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
let audioModules: Object[][];
let setAudioModules: (val: Object[][]) => void;

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
let isSettingsHover: boolean;
let setIsSettingsHover: (val: boolean) => void;
let isSettingsExpanded: boolean;
let setIsSettingsExpanded: (val: boolean) => void;

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
  [isSettingsHover, setIsSettingsHover] = useState(false);
  [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  [isVisualizing, setIsVisualizing] = useState(false);
  [isPlaying, setIsPlaying] = useState(false); // need to make these global!
  [hasUserGestured, setHasUserGestured] = useState(false); // Keep track of first gesture required to initialize audioCtx

  [audioModules, setAudioModules] = useState(tempModuleData); // Initial module will be the blank module
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
    // background: "red",
  };

  AudioBoxStyle.height = isExpanded
    ? `${audioModules.length * 255 + 100}px`
    : "40px";

  const CanvasStyle: CSS.Properties = {
    position: "absolute",
    bottom: "0px",
    width: "100%",
    height: "40px",
    transition: "all 0.3s", // for expansion and contraction
  };

  CanvasStyle.height = isExpanded ? "100px" : "40px";

  const SettingButtonStyle: CSS.Properties = {
    writingMode: "vertical-rl",
    position: "absolute",
    marginLeft: "98%",
    marginTop: "15%",
    width: "2%",
    height: "65px",
    border: "1px solid black",
    borderRadius: "6px",
    fontSize: "10px",
    textAlign: "center",
    backgroundColor: "lavender",
    opacity: isSettingsHover ? "100%" : "45%",
    zIndex: "10",
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

  const handleUserClickSettingsButton = () => {
    setIsSettingsExpanded(!isSettingsExpanded);
  };

  const handleMouseEnterSettingsButton = () => {
    setIsSettingsHover(true);
  };

  const handleMouseLeaveSettingsButton = () => {
    setIsSettingsHover(false);
  };

  /*
    Adds a module to the audioModules. This variable
    is for storing information regarding the displayed
    cards. it is NOT for storing individual audio nodes
  */
  const addModule = (): void => {
    let tempAudioModulesData: Object[][] = audioModules;

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
    setAudioModules(tempAudioModulesData);
  };

  const insertAudioNode = (
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
    return tempAudioNodes;
  };

  const addAudioNode = (data: Object) => {
    // add the audioNode to process audio data (2nd subarray only allows 2 audioNodes to synchronize with audioModules)

    if (audioNodes === undefined) {
      console.log("cannot add node to undefined audio nodes");
      return;
    }

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
        tempAudioNode.frequency.value = 20;
        insertAudioNode(tempAudioNodes, tempAudioNode);
        setAudioNodes(tempAudioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      case "Lowpass":
        tempAudioNode = aCtx!.createBiquadFilter();
        tempAudioNode.type = "lowpass";
        tempAudioNode.frequency.value = 21000;
        insertAudioNode(tempAudioNodes, tempAudioNode);
        setAudioNodes(tempAudioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      case "Reverb":
        tempAudioNode = aCtx!.createConvolver();
        tempAudioNode.buffer = impulseBuffer;
        insertAudioNode(tempAudioNodes, tempAudioNode);
        setAudioNodes(tempAudioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
    }

    // console.log(audioNodes);
  };

  const deleteAudioModuleAndNode = (position: number[]) => {
    // position is position of audio module
    let tempAudioModules = audioModules;
    tempAudioModules[position[0]].splice(position[1], 1); // works, but still need to shift and reorder elements around

    if (tempAudioModules[position[0]].length === 0) {
      // works
      tempAudioModules.splice(position[0], 1);
    } else {
      /*
       scan through 2d array and lay out elements linearly, keeping their respective ordering
       and place them into a linear 1D array. Then iterate through the array and divide them 
       into chunks of 3. Stop when array is empty.
      */

      let tempAudioModulesLinearArr: Object[] = [];

      for (let row = 0; row < tempAudioModules.length; row++) {
        // extract into 1d array
        for (let column = 0; column < tempAudioModules[row].length; column++) {
          if (tempAudioModules[row][column]) {
            tempAudioModulesLinearArr.push(tempAudioModules[row][column]);
          }
        }
      }

      tempAudioModules = [];

      while (tempAudioModulesLinearArr.length != 0) {
        tempAudioModules.push(tempAudioModulesLinearArr.splice(0, 3));
      }
    }

    setAudioModules(tempAudioModules);

    // ---------------------------- Deleting audio nodes ------------------------------

    // Offset row and column to account for structure of audioNodes array
    let row = position[0] + 1;
    let column = position[1];

    if (row === 1) {
      column -= 1;
    }

    let tempAudioNodesLinearArr: AudioNode[] = [];

    for (let i = 1; i < audioNodes!.length - 1; i++) {
      for (let j = 0; j < audioNodes![i].length; j++) {
        if (i === row && j === column) {
          // skip node to be deleted
          continue;
        }
        tempAudioNodesLinearArr.push(audioNodes![i][j]);
      }
    }

    let audioSourceBufferNode = [...audioNodes![0]];
    let analyserNode = [...audioNodes![audioNodes!.length - 1]];

    let tempAudioNodes = [audioSourceBufferNode, [], analyserNode];

    for (let i = 0; i < tempAudioNodesLinearArr.length; i++) {
      tempAudioNodes = [
        ...insertAudioNode(tempAudioNodes, tempAudioNodesLinearArr[i])!,
      ];
    }

    setAudioNodes(tempAudioNodes);
    setTimeout(() => {
      setAudioNodesChanged(true);
    }, 10);
  };

  const moveAudioModuleAndNode = (position: number[], isLeft: boolean) => {
    // moving audioModules

    if (position[0] === 0 && position[1] === 1 && isLeft === true) {
      console.log("Not moving left!");
      return; // do not move into blank audioModule space
    }

    if (
      position[0] === audioModules.length - 1 &&
      position[1] === audioModules[position[0]].length - 1 &&
      isLeft === false
    ) {
      // dont move last module right!
      console.log("Not moving right!");
      return;
    } else if (
      audioModules[position[0]].length - 1 > position[1] &&
      audioModules[position[0]][position[1] + 1].type === "New" &&
      isLeft === false
    ) {
      console.log("Not moving past new module!");
      return;
    } else if (
      audioModules.length - 1 > position[0] &&
      audioModules[position[0] + 1][0].type === "New" &&
      position[1] === 2 &&
      isLeft === false
    ) {
      console.log("Not moving past new module on new line!");
      return;
    }

    let tempAudioModules = audioModules;

    if (isLeft) {
      if (position[1] === 0) {
        let temp = tempAudioModules[position[0] - 1][2];
        tempAudioModules[position[0] - 1][2] =
          tempAudioModules[position[0]][position[1]];
        tempAudioModules[position[0]][position[1]] = temp;
      } else {
        let temp = tempAudioModules[position[0]][position[1] - 1];
        tempAudioModules[position[0]][position[1] - 1] =
          tempAudioModules[position[0]][position[1]];
        tempAudioModules[position[0]][position[1]] = temp;
      }
    } else {
      if (position[1] === 2) {
        let temp = tempAudioModules[position[0] + 1][0];
        tempAudioModules[position[0] + 1][0] =
          tempAudioModules[position[0]][position[1]];
        tempAudioModules[position[0]][position[1]] = temp;
      } else {
        let temp = tempAudioModules[position[0]][position[1] + 1];
        tempAudioModules[position[0]][position[1] + 1] =
          tempAudioModules[position[0]][position[1]];
        tempAudioModules[position[0]][position[1]] = temp;
      }
    }

    setAudioModules(audioModules);

    // moving audioNodes
    /*
      Operating under the assumption that if audioModules can be moved,
      then audioNodes can be moved as well. Will not re-conduct the checks
      performed above for the audioNodes
    */

    let tempAudioNodes = [...audioNodes!];

    // Offset row and column to account for structure of audioNodes array
    let row = position[0] + 1;
    let column = position[1];

    if (row === 1) {
      column -= 1;
    }

    if (isLeft) {
      if (column === 0) {
        let tempAudioNode =
          tempAudioNodes[row - 1][tempAudioNodes[row - 1].length - 1];
        tempAudioNodes[row - 1][tempAudioNodes[row - 1].length - 1] =
          tempAudioNodes[row][column];
        tempAudioNodes[row][column] = tempAudioNode;
      } else {
        let tempAudioNode = tempAudioNodes[row][column - 1];
        tempAudioNodes[row][column - 1] = tempAudioNodes[row][column];
        tempAudioNodes[row][column] = tempAudioNode;
      }
    } else {
      if (column === tempAudioNodes[row].length - 1) {
        let tempAudioNode = tempAudioNodes[row + 1][0];
        tempAudioNodes[row + 1][0] = tempAudioNodes[row][column];
        tempAudioNodes[row][column] = tempAudioNode;
      } else {
        let tempAudioNode = tempAudioNodes[row][column + 1];
        tempAudioNodes[row][column + 1] = tempAudioNodes[row][column];
        tempAudioNodes[row][column] = tempAudioNode;
      }
    }

    setAudioNodes(tempAudioNodes);
  };

  const editAudioNodeData = (data: Object, position: number[]) => {
    let tempAudioNodes = audioNodes;

    // Offset row and column to account for structure of audioNodes array
    let row = position[0] + 1;
    let column = position[1];

    if (row === 1) {
      column -= 1;
    }

    // console.log(tempAudioNodes![position[0] + 1][position[1]]);
    // console.log(tempAudioNodes, row, column);

    if (data.type === "Highpass" || data.type === "Lowpass") {
      tempAudioNodes![row][column].frequency.value = data.frequency;
      tempAudioNodes![row][column].Q.value = data.resonance;
    }

    setAudioNodes(tempAudioNodes);

    // data object contains configuration information for a given audioNode
    // position [row, column] contains the index of the audioModule whose data is being changed.
  };

  let editAudioModuleData = (data: Object, position: number[]) => {
    let tempAudioModules = [...audioModules];
    tempAudioModules[position[0]][position[1]] = data;
    setAudioModules(tempAudioModules);
  };

  /*
    New node will be able to select it's type and it will 
    switch to that type of module (and create the corresponding
    audio node)
  */
  const setModuleType = (type: string, moduleIndex: number[]): void => {
    let tempAudioModulesData: Object[][] = audioModules;

    // settings for all audioModules
    tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].type = type;
    tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].isEnabled = true;

    // module specific settings
    /*
      AudioModule freq and resonance are initially set here,
      but then their values are set from the audioNodes that
      they represent.
    */
    if (type === "Highpass") {
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].frequency = 20;
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].resonance = 0;
    } else if (type === "Lowpass") {
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].frequency = 21000;
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].resonance = 0;
    }

    addAudioNode(tempAudioModulesData[moduleIndex[0]][moduleIndex[1]]);
    setAudioModules(tempAudioModulesData);
  };

  const saveConfiguration = () => {
    let config = JSON.stringify(audioModules); // this object, when loaded into the loadConfiguration method will work.
    console.log(config);
  };

  const loadConfiguration = () => {
    // works!
    /*
    load any configuration that was saved with saveConfiguration()
    */
    let testConfig = [
      [
        { type: "Blank" },
        { type: "Highpass", frequency: 20, resonance: 0 },
        { type: "Lowpass", frequency: 21000, resonance: 0 },
      ],
      [
        { type: "Reverb" },
        { type: "Highpass", frequency: 20, resonance: 0 },
        { type: "Lowpass", frequency: 21000, resonance: 0 },
      ],
      [{ type: "New" }],
    ];

    setAudioModules(testConfig);

    let tempAudioNodes = [...audioNodes!];

    while (tempAudioNodes.length > 2) {
      tempAudioNodes?.splice(1, 1); // delete all previous audioNodes
    }

    setAudioNodes(tempAudioNodes); // set cleared audioNodes before adding configured ones

    let addNewAudioNodes = () => {
      for (let i = 0; i < testConfig.length; i++) {
        for (let j = 0; j < testConfig[i].length; j++) {
          if (i === 0 && j === 0) {
            continue;
          }

          if (testConfig[i][j].type === "New") {
            // dont add the new module as an audioNode
            break;
          }
          addAudioNode(testConfig[i][j]); // add configured audio nodes
        }
      }
    };

    setTimeout(addNewAudioNodes, 10); // need a slight delay to allow the audio nodes state to set before adding nodes
  };

  /*
    Generate the UI for audio modules that are displayed
  */
  const generateAudioSettingsFragment = (): JSX.Element => {
    let audioSettingsFragment: JSX.Element;

    audioSettingsFragment = (
      <>
        {audioModules.map((item, idx) => {
          return (
            <AudioModuleContainer
              containerIndex={idx}
              modules={item}
              key={idx}
              addModule={addModule}
              deleteAudioModuleAndNode={deleteAudioModuleAndNode}
              setModuleType={setModuleType}
              editAudioNodeData={editAudioNodeData}
              moveAudioModuleAndNode={moveAudioModuleAndNode}
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
        <div
          style={SettingButtonStyle}
          onMouseEnter={handleMouseEnterSettingsButton}
          onMouseLeave={handleMouseLeaveSettingsButton}
          onClick={handleUserClickSettingsButton}
        >
          Settings
        </div>
        <AudioSettingsDrawer
          isSettingsExpanded={isSettingsExpanded}
          saveConfiguration={saveConfiguration}
          loadConfiguration={loadConfiguration}
        ></AudioSettingsDrawer>
        {generateAudioSettingsFragment()}
        <canvas style={CanvasStyle} ref={canvasRef}></canvas>
        <AudioController
          hasUserGestured={hasUserGestured}
          isPlaying={isPlaying}
          isExpanded={isExpanded}
          isSettingsExpanded={isSettingsExpanded}
          songTime={songTime}
          songDuration={songDuration}
          areAudioNodesReady={areAudioNodesReady}
          setIsPlaying={setIsPlaying}
          setIsExpanded={setIsExpanded}
          setIsSettingsExpanded={setIsSettingsExpanded}
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
