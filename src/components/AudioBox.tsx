import { useState } from "react";
import { useRef } from "react";
import CSS from "csstype";

import AudioController from "./AudioController";
import AudioModuleContainer from "./AudioModuleContainer";
import AudioSettingsDrawer from "./AudioSettingsDrawer";

import {
  useInitAudioCtx,
  useFetchAudioAndInitNodes,
  useReconnectNodes,
  usePlayAndResume,
  usePauseSong,
  useTrackSongTime,
  useInitVisualizer,
  useInitCanvas,
  useDraw,
} from "../webAudioHooks";

import tempSong from "../assets/songs/telepathy.mp3"; // when only 1 track was supported

import bass from "../assets/songs/stems/bass.mp3";
import chords from "../assets/songs/stems/chords.mp3";
import drums from "../assets/songs/stems/drums.mp3";
import leads from "../assets/songs/stems/leads.mp3";
import reverb from "../assets/songs/stems/reverb.mp3";
import master from "../assets/songs/stems/master.mp3"; // change this to change master song

// import impulse0 from "../assets/impulseResponses/0.wav";
import impulse1 from "../assets/impulseResponses/1.wav";
import impulse2 from "../assets/impulseResponses/2.wav";
import impulse3 from "../assets/impulseResponses/3.wav";
import impulse4 from "../assets/impulseResponses/4.wav";
import impulse5 from "../assets/impulseResponses/5.wav";
import impulse6 from "../assets/impulseResponses/6.wav";
import impulse7 from "../assets/impulseResponses/7.wav";
import impulse8 from "../assets/impulseResponses/8.wav";
import impulse9 from "../assets/impulseResponses/9.wav";
import impulse10 from "../assets/impulseResponses/10.wav";
import impulse11 from "../assets/impulseResponses/11.wav";
import impulse12 from "../assets/impulseResponses/12.wav";
import impulse13 from "../assets/impulseResponses/13.wav";
import impulse14 from "../assets/impulseResponses/14.wav";
import impulse15 from "../assets/impulseResponses/15.wav";
import impulse16 from "../assets/impulseResponses/16.wav";
import impulse17 from "../assets/impulseResponses/17.wav";
import impulse18 from "../assets/impulseResponses/18.wav";

console.log("AudioBox Rerender!");

// Audio context
let aCtx: AudioContext | undefined;
let setACtx: (val: any) => void;

// song buffer, song info, and audio buffers
let currentTrackIdx: number;
let setCurrentTrackIdx: (val: any) => void;
// let currentTrack: AudioBuffer | undefined; // not needed, because tracks will run in parallel
// let setCurrentTrack: (val: any) => void;
let trackBuffers: AudioBuffer[] | undefined;
let setTrackBuffers: (val: any) => void;
let settingsTracksData: Object[] | undefined;
let setSettingsTracksData: (val: any) => void;
// let impulseBuffer: AudioBuffer | undefined;
// let setImpulseBuffer: (val: any) => void;
let impulseBuffers: AudioBuffer[] | undefined;
let setImpulseBuffers: (val: any) => void;
let songDuration: number;
let setSongDuration: (val: any) => void;

let tracks: Object = {
  bass: bass,
  chords: chords,
  drums: drums,
  leads: leads,
  reverb: reverb,
  master: master,
};

let tracksJSON = JSON.stringify(tracks);

let impulses: Object = {
  // impulse0: impulse0,
  impulse1: impulse1,
  impulse2: impulse2,
  impulse3: impulse3,
  impulse4: impulse4,
  impulse5: impulse5,
  impulse6: impulse6,
  impulse7: impulse7,
  impulse8: impulse8,
  impulse9: impulse9,
  impulse10: impulse10,
  impulse11: impulse11,
  impulse12: impulse12,
  impulse13: impulse13,
  impulse14: impulse14,
  impulse15: impulse15,
  impulse16: impulse16,
  impulse17: impulse17,
  impulse18: impulse18,
};

let impulsesJSON = JSON.stringify(impulses);

// AudioNodes (actual audio nodes)
let audioNodes: AudioNode[][][] | undefined;
let setAudioNodes: (val: any) => void;
let audioNodesChanged: boolean;
let setAudioNodesChanged: (val: any) => void;
let analyserNode: AudioNode | undefined;
let setAnalyserNode: (val: any) => void;

// audioModules (data required for creating UI for audio nodes)
let audioModules: Object[][];
let setAudioModules: (val: Object[][]) => void;
let audioModulesJSON: string[];
let setAudioModulesJSON: (val: string[]) => void;

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
  [audioModulesJSON, setAudioModulesJSON] = useState(['[[{"type":"Blank"}]]']); // JSON array, kept as state, to keep track of audioModule present for each track.
  [areAudioNodesReady, setAreAudioNodesReady] = useState(false);

  [aCtx, setACtx] = useState(undefined); // aCtx and setACtx type are the way they are beause an audioCtx cannot be initialized on render.
  // [songBuffer, setSongBuffer] = useState(undefined);
  [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  // [currentTrack, setCurrentTrack] = useState(undefined);
  [trackBuffers, setTrackBuffers] = useState(undefined);
  [settingsTracksData, setSettingsTracksData] = useState(undefined);
  // [impulseBuffer, setImpulseBuffer] = useState(undefined);
  [impulseBuffers, setImpulseBuffers] = useState(undefined);
  [songDuration, setSongDuration] = useState(0);
  [audioNodes, setAudioNodes] = useState(undefined);
  [analyserNode, setAnalyserNode] = useState(undefined);
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

  useFetchAudioAndInitNodes(
    aCtx,
    tracksJSON,
    impulsesJSON,
    setTrackBuffers,
    setSettingsTracksData,
    setImpulseBuffers,
    // setCurrentTrack,
    setCurrentTrackIdx,
    setSongDuration,
    setAudioNodes,
    setAnalyserNode,
    setAreAudioNodesReady,
    setAudioModulesJSON
  );

  useReconnectNodes(
    aCtx,
    audioNodes,
    analyserNode,
    audioModules,
    currentTrackIdx,
    audioNodesChanged,
    setAudioNodesChanged
  );

  usePlayAndResume(
    aCtx,
    audioNodes,
    trackBuffers,
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
    // audioNodes,
    analyserNode,
    canvasRef,
    setBufferLength,
    setDataArr,
    setCanvas,
    setCanvasCtx
  );

  useInitCanvas(canvasRef);

  useDraw(
    canvas,
    canvasCtx,
    analyserNode,
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
        tempAudioNode.buffer = impulseBuffers[0];
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

    console.log(audioNodes);

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
    } else if (data.type === "Reverb") {
      tempAudioNodes![row][column].buffer = impulseBuffers![data.impulse];
    } else if (data.type === "TrackChange") {
      setCurrentTrack(trackBuffers![data.track]);
    }

    setAudioNodes(tempAudioNodes);

    if (data.type === "TrackChange") {
      if (!isPlaying) {
        setIsPlaying(true);
      }

      setIsPlaying(false);
      setTimeout(() => {
        setIsPlaying(true);
      }, 10);
    }

    // data object contains configuration information for a given audioNode
    // position [row, column] contains the index of the audioModule whose data is being changed.
  };

  let editAudioModuleData = () => {
    setAudioNodesChanged(true); // trigger the reconnection process, whereby an audioNode will be reconnected / skipped.
    /*
      Not required, because audioModule data is being mutated directly
      within their respective audioModules as the data (passed as prop)
      is passed by reference.
    */
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
    } else if (type === "Reverb") {
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].impulse = 0;
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
    return;
    console.log(audioModulesJSON);

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
  const generateAudioModuleContainers = (): JSX.Element => {
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
              setAudioNodesChanged={setAudioNodesChanged}
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
          settingsTracksData={settingsTracksData}
          audioModulesJSON={audioModulesJSON}
          audioModules={audioModules}
          isSettingsExpanded={isSettingsExpanded}
          currentTrackIdx={currentTrackIdx}
          setAudioModulesJSON={setAudioModulesJSON}
          setAudioModules={setAudioModules}
          setCurrentTrackIdx={setCurrentTrackIdx}
          setSettingsTracksData={setSettingsTracksData}
          saveConfiguration={saveConfiguration}
          loadConfiguration={loadConfiguration}
          editAudioNodeData={editAudioNodeData}
        ></AudioSettingsDrawer>
        {generateAudioModuleContainers()}
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
