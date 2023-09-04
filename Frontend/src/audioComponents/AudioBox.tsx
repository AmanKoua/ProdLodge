import { useState, useRef, useEffect, useContext } from "react";
import CSS from "csstype";

import AudioController from "./AudioController";
import AudioModuleContainer from "./AudioModuleContainer";
import AudioSettingsDrawer from "./AudioSettingsDrawer";
import { AuthContext } from "../context/AuthContext";

/*
Cannot use hooks imported from another module because variables used can be 
accessed / corrupted by other AudioBox instances. I'd prefer not to keep 
all useEffects definitions in this file, but I dont see another option.
*/

// import {
//   useInitAudioCtx,
//   useFetchAudioAndInitNodes,
//   useReconnectNodes,
//   usePlayAndResume,
//   usePauseSong,
//   useTrackSongTime,
//   useInitVisualizer,
//   useInitCanvas,
//   useDraw,
// } from "../webAudioHooks";

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

interface Props {
  songData: Object;
  setIsUserSongPayloadSet: (val: boolean) => void;
}

const AudioBox = ({ songData, setIsUserSongPayloadSet }: Props) => {
  // console.log("AudioBox Rerender!");
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
  let tempModuleData: Object[][] = [[{ type: "Blank" }]];

  const authContext = useContext(AuthContext);

  // Audio context
  let aCtx: AudioContext | undefined;
  let setACtx: (val: any) => void;

  // song buffer, song info, and audio buffers
  let currentTrackIdx: number;
  let setCurrentTrackIdx: (val: any) => void;
  let trackBuffers: AudioBuffer[] | undefined;
  let setTrackBuffers: (val: any) => void;
  let settingsTracksData: Object[] | undefined;
  let setSettingsTracksData: (val: any) => void;
  let impulseBuffers: AudioBuffer[] | undefined;
  let setImpulseBuffers: (val: any) => void;
  let songDuration: number;
  let setSongDuration: (val: any) => void;

  // AudioNodes (actual audio nodes)
  let audioNodes: AudioNode[][][] | undefined;
  let setAudioNodes: (val: any) => void;
  let initAudioNodes: AudioNode[][][] | undefined; // audioNodes when first initialized
  let setInitAudioNodes: (val: any) => void;
  let audioNodesChanged: boolean;
  let setAudioNodesChanged: (val: any) => void;
  let analyserNode: AudioNode | undefined;
  let setAnalyserNode: (val: any) => void;

  // audioModules (data required for creating UI for audio nodes)
  let audioModules: Object[][];
  let setAudioModules: (val: Object[][]) => void;
  let audioModulesJSON: string[];
  let setAudioModulesJSON: (val: string[]) => void;
  let initAudioModulesJSON: string[]; // audioModules when first initialized
  let setInitAudioModulesJSON: (val: string[]) => void;

  // Canvas and context
  let canvas: HTMLCanvasElement | undefined;
  let setCanvas: (val: any) => void;
  let canvasCtx: CanvasRenderingContext2D | undefined;
  let setCanvasCtx: (Val: any) => void;
  let animationFrameHandler: number | undefined; // value is used in effects hooks
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

  canvasRef = useRef(null); // reference to canvas

  [isExpanded, setIsExpanded] = useState(false);
  [isSettingsHover, setIsSettingsHover] = useState(false);
  [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  [isVisualizing, setIsVisualizing] = useState(false);
  [isPlaying, setIsPlaying] = useState(false); // need to make these global!
  [hasUserGestured, setHasUserGestured] = useState(false); // Keep track of first gesture required to initialize audioCtx

  [audioModules, setAudioModules] = useState(tempModuleData); // Initial module will be the blank module
  [initAudioModulesJSON, setInitAudioModulesJSON] = useState([
    '[[{"type":"Blank"}]]',
  ]);
  [audioModulesJSON, setAudioModulesJSON] = useState(['[[{"type":"Blank"}]]']); // JSON array, kept as state, to keep track of audioModule present for each track.
  [areAudioNodesReady, setAreAudioNodesReady] = useState(false);

  [aCtx, setACtx] = useState(undefined); // aCtx and setACtx type are the way they are beause an audioCtx cannot be initialized on render.
  [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  [trackBuffers, setTrackBuffers] = useState(undefined);
  [settingsTracksData, setSettingsTracksData] = useState(undefined);
  [impulseBuffers, setImpulseBuffers] = useState(undefined);
  [songDuration, setSongDuration] = useState(0);
  [audioNodes, setAudioNodes] = useState(undefined);
  [initAudioNodes, setInitAudioNodes] = useState(undefined);
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

  let useInitAudioCtx = (
    hasUserGestured: boolean,
    setACtx: (val: any) => void
  ) => {
    useEffect(() => {
      // initialze audio context on first gesture
      if (!hasUserGestured) {
        return;
      }

      console.log("audio context init!");
      setACtx(new AudioContext());
    }, [hasUserGestured]);
  };

  let useFetchAudioAndInitNodes = (
    aCtx: AudioContext | undefined,
    tracksJSON: string,
    impulsesJSON: string,
    setTrackBuffers: (val: any) => void,
    setSettingsTracksData: (val: any) => void,
    setImpulseBuffers: (val: any) => void,
    // setCurrentTrack: (val: any) => void,
    setCurrentTrackIdx: (val: number) => void,
    setSongDuration: (val: any) => void,
    setAudioNodes: (val: any) => void,
    setAnalyserNode: (val: any) => void,
    setAreAudioNodesReady: (val: boolean) => void,
    setAudioModulesJSON: (val: string[]) => void
  ) => {
    useEffect(() => {
      // Fetch audio data and initialize primary nodes
      if (
        // If any of these are missing, do not initialize track fetching
        aCtx === undefined ||
        !authContext ||
        !authContext.user ||
        !authContext.user.token
      ) {
        return;
      }

      console.log("fetching audio!");

      let tempTracks = JSON.parse(tracksJSON);
      let tempImpulses = JSON.parse(impulsesJSON);

      // console.log(tempTracks);
      // console.log(tempImpulses);

      let fetchImpulseResponses = async () => {
        let tempImpulseBuffers: AudioBuffer[] = [];
        let tempImpulsesKeys: string[] = Object.keys(tempImpulses);

        for (let i = 0; i < tempImpulsesKeys.length; i++) {
          console.log("impulse fetched!");
          let response = await fetch(tempImpulses[tempImpulsesKeys[i]]);
          let arrayBuffer = await response.arrayBuffer();
          await aCtx.decodeAudioData(arrayBuffer, (decodedBuffer) => {
            tempImpulseBuffers.push(decodedBuffer);
          });
        }
        setImpulseBuffers(tempImpulseBuffers!);
      };

      let fetchTracks = async () => {
        let tempTrackBuffers: AudioBuffer[] = [];
        // let songTrackIds: string[] = Object.keys(tempTracks);
        let songTrackIds: string[] = songData.trackIds;
        let tempSettingsTracksData: Object[] = [];
        let tempAudioModulesJSON: string[] = ['[[{"type":"Blank"}]]'];

        for (let i = 0; i < songTrackIds.length; i++) {
          console.log("track fetched!");

          let response = await fetch(
            `http://localhost:8005/tracks/${songTrackIds[i]}`,
            {
              method: "GET",
              headers: {
                authorization: `Bearer ${authContext.user.token}`,
              },
            }
          );

          if (response.ok) {
            let trackName = response.headers.get("Trackname");
            let arrayBuffer = await response.arrayBuffer();

            await aCtx.decodeAudioData(arrayBuffer, (decodedBuffer) => {
              let tempTracksData = {};

              if (songTrackIds[i] === "master") {
                tempTracksData.isEnabled = false;
              } else {
                tempTracksData.isEnabled = true;
                setCurrentTrackIdx(i);
              }

              tempTrackBuffers.push(decodedBuffer);

              tempTracksData.name = trackName;
              tempTracksData.moduleCount = 0;
              tempTracksData.idx = i;
              tempSettingsTracksData.push(tempTracksData);
              if (i !== 0) {
                // skip 1, because 1 is already defined when the audioModulesState is set!
                tempAudioModulesJSON.push('[[{"type":"Blank"}]]');
              }
            });
          } else {
            alert("Track fetching failed!");
            break;
          }
        }
        setTrackBuffers(tempTrackBuffers!);
        setSongDuration(tempTrackBuffers![0].duration);
        setSettingsTracksData(tempSettingsTracksData);
        setAudioModulesJSON(tempAudioModulesJSON);
        setInitAudioModulesJSON(tempAudioModulesJSON);
        await createPrimaryNodes(tempTrackBuffers!, tempSettingsTracksData);
      };

      let createPrimaryNodes = async (
        songBuffers: AudioBuffer[],
        tempSettingsTracksData: Object[] // to tell if gain should be on / off
      ) => {
        // create audioBufferSourceNode and analyserNode

        console.log("creating primary nodes!");

        let tempAnalyserNode: AnalyserNode = aCtx!.createAnalyser();
        tempAnalyserNode.fftSize = 2048;
        setAnalyserNode(tempAnalyserNode);

        let tempAudioNodesArr: AudioNode[][][] = [];

        for (let i = 0; i < songBuffers.length; i++) {
          let tempAudioNodeSubArr = [];

          let tempAudioSourceNode: AudioBufferSourceNode =
            aCtx!.createBufferSource();
          tempAudioSourceNode.buffer = songBuffers[i];
          tempAudioNodeSubArr.push([tempAudioSourceNode]);

          let tempGainNode: GainNode = aCtx!.createGain();
          if (tempSettingsTracksData[i].isEnabled) {
            tempGainNode.gain.value = 1; // enabled
          } else {
            tempGainNode.gain.value = 0; // muted
          }
          tempAudioNodeSubArr.push([tempGainNode]);
          tempAudioNodesArr.push(tempAudioNodeSubArr);
        }

        setAudioNodes(tempAudioNodesArr);
        setInitAudioNodes(tempAudioNodesArr);
        setAreAudioNodesReady(true);
      };

      fetchImpulseResponses();
      fetchTracks();
    }, [aCtx]);
  };

  let useReconnectNodes = (
    aCtx: AudioContext | undefined,
    audioNodes: AudioNode[][][] | undefined,
    analyserNode: AudioNode | undefined,
    audioModules: Object[][],
    audioModulesJSON: string[],
    settingsTracksData: Object[] | undefined,
    currentTrackIdx: number,
    audioNodesChanged: boolean,
    setAudioNodesChanged: (val: any) => void
  ) => {
    useEffect(() => {
      // disconnect and reconnect all audioNodes
      if (audioNodes === undefined || analyserNode === undefined) {
        return;
      }

      if (!audioNodesChanged) {
        return;
      }

      console.log("connecting audio nodes!");
      let audioModuleRow: number;
      let audioModuleColumn: number;

      for (let x = 0; x < audioNodes.length; x++) {
        let tempAudioNodes = audioNodes[x]; // 2d audioNodes structure now

        if (tempAudioNodes.length === 2) {
          // only audioBufferSourceNode and gainNode
          tempAudioNodes[0][0].disconnect();
          tempAudioNodes[0][0].connect(tempAudioNodes[1][0]);
          tempAudioNodes[1][0].disconnect();
          tempAudioNodes[1][0].connect(analyserNode!);
          tempAudioNodes[1][0].connect(aCtx!.destination);

          if (settingsTracksData![x].isEnabled) {
            tempAudioNodes[1][0].gain.value = 1;
          } else {
            tempAudioNodes[1][0].gain.value = 0;
          }
        } else {
          // loop through audioNodes and connect them one by one
          let currentNode = tempAudioNodes[0][0]; // start with audioSourceBufferNode;
          let gainNode = tempAudioNodes[tempAudioNodes.length - 1][0]; // gainNode
          for (let i = 1; i < tempAudioNodes.length - 1; i++) {
            // row
            for (let j = 0; j < tempAudioNodes[i].length; j++) {
              // column

              if (x === currentTrackIdx) {
                // convert audioNode location to audioModule location
                audioModuleRow = i - 1;
                audioModuleColumn = j;

                if (audioModuleRow === 0) {
                  audioModuleColumn += 1;
                }

                if (
                  !audioModules[audioModuleRow][audioModuleColumn].isEnabled
                ) {
                  // this line breaks IF audioNodes are not reset along with audioModules when a track is changed
                  // if audioModule is not enabled, skip connection!
                  continue;
                }

                currentNode.disconnect();
                currentNode.connect(tempAudioNodes[i][j]);
                currentNode = tempAudioNodes[i][j];
              } else {
                let tempAudioModules = JSON.parse(audioModulesJSON[x]);

                // convert audioNode location to audioModule location
                audioModuleRow = i - 1;
                audioModuleColumn = j;

                if (audioModuleRow === 0) {
                  audioModuleColumn += 1;
                }

                // console.log(JSON.stringify(audioModules));

                if (
                  !tempAudioModules[audioModuleRow][audioModuleColumn].isEnabled
                ) {
                  // this line breaks IF audioNodes are not reset along with audioModules when a track is changed
                  // if audioModule is not enabled, skip connection!
                  continue;
                }

                currentNode.disconnect();
                currentNode.connect(tempAudioNodes[i][j]);
                currentNode = tempAudioNodes[i][j];
              }
            }
          }
          currentNode.disconnect();
          currentNode.connect(gainNode);
          gainNode.connect(analyserNode);
          gainNode.connect(aCtx!.destination);

          if (settingsTracksData![x].isEnabled) {
            gainNode.gain.value = 1;
          } else {
            gainNode.gain.value = 0;
          }
        }
      }

      setAudioNodesChanged(false);

      /*
        For some reason, the cleanup function breaks when the hook is extracted into this file but works fine when implemented in audioBox.tsx directly.
      */
      // return () => {
      //   // cleanup function disconnects all audio nodes
      //   if (audioNodes === undefined) {
      //     return;
      //   }
      //   if (audioNodesChanged) {
      //     return;
      //   }

      //   for (let i = 0; i < audioNodes.length - 1; i++) {
      //     for (let j = 0; j < audioNodes[i].length; j++) {
      //       audioNodes[i][j].disconnect();
      //     }
      //   }
      // };
    }, [audioNodes, audioNodesChanged]);
  };

  let usePlayAndResume = (
    aCtx: AudioContext | undefined,
    audioNodes: AudioNode[][][] | undefined,
    trackBuffers: AudioBuffer[] | undefined,
    isPlaying: boolean,
    songTime: number = 0,
    setSongTime: (val: number) => void,
    setAudioNodes: (val: any) => void,
    setAudioNodesChanged: (val: any) => void
  ) => {
    useEffect(() => {
      // Play (resume requires recreation of source node)
      if (!isPlaying) {
        return;
      }

      if (
        aCtx === undefined ||
        audioNodes === undefined ||
        trackBuffers === undefined
      ) {
        return;
      }

      console.log("play / resume!");

      let tempAudioNodes = audioNodes; // I suspect that this is NOT seen as a different array upon mutation because the reference is the same

      for (let i = 0; i < audioNodes.length; i++) {
        let tempAudioSourceNode: AudioBufferSourceNode =
          aCtx!.createBufferSource();
        tempAudioSourceNode.buffer = trackBuffers![i];

        tempAudioNodes[i][0][0] = tempAudioSourceNode;
      }

      setAudioNodes(tempAudioNodes);
      setAudioNodesChanged(true); // trigger the reconnection process

      if (songTime < 0) {
        setSongTime(0);
      }

      for (let i = 0; i < audioNodes.length; i++) {
        // will need to check that they all start at the same time...
        audioNodes![i][0][0].start(0, songTime);
      }
    }, [isPlaying]);
  };

  let usePauseSong = (
    isPlaying: boolean,
    audioNodes: AudioNode[][][] | undefined
  ) => {
    useEffect(() => {
      // pause when pause button clicked!
      if (isPlaying || audioNodes === undefined) {
        return;
      }

      for (let i = 0; i < audioNodes.length; i++) {
        audioNodes[i][0][0].stop();
      }
    }, [isPlaying]);
  };

  /* 
    It seems that songTime is only passed once, and is not passed again when setSongTime is used.
    Local variable tempSongTime MUST be used!
  */

  let tempSongTime = 0; // necessary for tracking song time from a custom hook

  let useTrackSongTime = (
    isPlaying: boolean,
    songTime: number,
    songTimeInterval: number | undefined,
    setSongTime: (val: number) => void,
    setSongTimeInterval: (val: any) => void
  ) => {
    useEffect(() => {
      // track song time (set and clear tracking setInterval)

      if (songTimeInterval === undefined && !isPlaying) {
        return;
      }

      // console.log("tracking song time!");

      if (isPlaying) {
        if (songTimeInterval != undefined) {
          clearInterval(songTimeInterval);
        }

        tempSongTime = songTime;

        songTimeInterval = setInterval(() => {
          tempSongTime += 0.1;
          setSongTime(tempSongTime);
        }, 100);

        setSongTimeInterval(songTimeInterval);
      } else {
        clearInterval(songTimeInterval);
      }

      return () => {
        if (songTimeInterval === undefined) {
          return;
        }

        clearInterval(songTimeInterval);
      };
    }, [isPlaying]);
  };

  let useInitCanvas = (canvasRef: any) => {
    // Initialize canvas so that audioModuelContainer does not bleed through
    useEffect(() => {
      let canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx!.fillStyle = "rgb(255, 255, 255)";
      canvasCtx!.fillRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }, []);
  };

  let useInitVisualizer = (
    isVisualizing: boolean,
    // audioNodes: AudioNode[][] | undefined,
    analyserNode: AudioNode | undefined,
    canvasRef: any,
    setBufferLength: (val: any) => void,
    setDataArr: (val: any) => void,
    setCanvas: (val: any) => void,
    setCanvasCtx: (Val: any) => void
  ) => {
    useEffect(() => {
      // initialize visualizer

      if (!isVisualizing) {
        return;
      }

      if (analyserNode === undefined) {
        console.log("canvas init dependencies undefined!");
        return;
      }

      console.log("initializing visualizer!");

      let tempDataArrSize = analyserNode.frequencyBinCount;
      let tempDataArr = new Uint8Array(tempDataArrSize);

      setBufferLength(tempDataArrSize);
      setDataArr(tempDataArr);

      setTimeout(() => {
        analyserNode.getByteTimeDomainData(tempDataArr);
      }, 10);

      setCanvas(canvasRef.current!);

      setTimeout(() => {
        setCanvasCtx(canvasRef.current.getContext("2d"));
      }, 10);
    }, [isVisualizing]);
  };

  let useDraw = (
    canvas: HTMLCanvasElement | undefined,
    canvasCtx: CanvasRenderingContext2D | undefined,
    analyserNode: AudioNode | undefined,
    dataArr: Uint8Array | undefined,
    bufferLength: number | undefined,
    setAnimationFrameHandler: (val: any) => void
  ) => {
    useEffect(() => {
      // draw visualizations!
      if (
        canvas === undefined ||
        canvasCtx === undefined ||
        analyserNode === undefined ||
        dataArr === undefined ||
        bufferLength === undefined
      ) {
        console.log("Drawing visualizatons dependencies undefined!");
        return;
      }

      console.log("Starting visualizer!");

      // let canvas = canvasRef.current;
      // let canvasCtx = canvas.getContext("2d");

      let draw = () => {
        setAnimationFrameHandler(requestAnimationFrame(draw));
        analyserNode.getByteTimeDomainData(dataArr);

        canvasCtx!.fillStyle = "rgb(255, 255, 255)";
        canvasCtx!.fillRect(0, 0, canvas!.width, canvas!.height);

        canvasCtx!.lineWidth = 1;
        canvasCtx!.strokeStyle = "rgb(0, 0, 0)";

        // oscilloscope

        canvasCtx!.beginPath();
        const sliceWidth = (canvas!.width * 1.0) / bufferLength!;
        let x = 0;

        for (let i = 0; i < bufferLength!; i++) {
          const v = dataArr![i] / 128.0;
          const y = (v * canvas!.height) / 2;

          if (i === 0) {
            canvasCtx!.moveTo(x, y);
          } else {
            canvasCtx!.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx!.lineTo(canvas!.width, canvas!.height / 2);
        canvasCtx!.stroke();
      };

      draw(); // call draw once!
    }, [canvasCtx]);
  };

  let useAttachEventListener = (
    isEventHandlerAttached: boolean,
    audioControllerRef: any,
    audioControllerElement: HTMLDivElement,
    setIsEventHandlerAttached: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    useEffect(() => {
      // attach eventHandler to AudioControllerDiv

      if (!hasUserGestured || !areAudioNodesReady || isEventHandlerAttached) {
        return;
      }

      // alert("AudioController eventhandler attached!");

      const handleAudioControllerClick = async (event: MouseEvent) => {
        if (event.target === audioControllerRef.current) {
          // console.log(audioControllerRef.current);
          // audioControllerRef.current.style.backgroundColor = "green";
          // console.log("CLICK!");

          let x = event.clientX;
          let left = audioControllerElement.getBoundingClientRect().left;
          let right = audioControllerElement.getBoundingClientRect().right;
          let width = right - left;
          let position = (x - left) / width; // position percentage

          if (position < 0) {
            position = 0;
          }

          // console.log(position);
          // setSongTimeWidth(position * 100);
          setIsPlaying(false);
          setSongTime(songDuration * position);
          setTimeout(() => {
            // wait for 1 millisecond to allow song time to update
            setIsPlaying(true);
          }, 1);
        } else {
        }
      };

      if (audioControllerRef.current) {
        audioControllerRef.current.addEventListener(
          "click",
          handleAudioControllerClick
        );
      }

      setIsEventHandlerAttached(true);
      startVisualizer();
    }, [songDuration]);
  };

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
    audioModulesJSON,
    settingsTracksData,
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

  const MasterContainerStyle: CSS.Properties = {
    width: "50%",
    height: "340px",
    marginTop: "55px",
    marginLeft: "auto",
    marginRight: "auto",
    transition: "all 0.3s",
    // backgroundColor: "beige",
  };

  MasterContainerStyle.height = isExpanded
    ? `${audioModules.length * (215 - audioModules.length) + 100}px`
    : "40px";

  MasterContainerStyle.marginBottom = isExpanded ? "120px" : "55px";

  const SongDataContainerStyle: CSS.Properties = {
    display: "flex",
    justifyContent: "space-evenly",
    width: "100%",
    height: "40px",
    transition: "all 0.3s",
    backgroundColor: "#edf4fc",
  };

  SongDataContainerStyle.height = isExpanded ? "100px" : "40px";

  const SongDataContainerElementStyle: CSS.Properties = {
    width: "47.5%",
    justifyContent: "center",
    overflow: "hidden",
    // border: "1px solid black",
    // backgroundColor: "green",
  };

  const AudioBoxStyle: CSS.Properties = {
    position: "relative",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "0%",
    width: "100%",
    height: "300px",
    border: "1px solid black",
    transition: "all 0.3s",
    overflow: "hidden",
    // background: "red",
  };

  AudioBoxStyle.height = isExpanded
    ? `${audioModules.length * (215 - audioModules.length) + 100}px`
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

  const generateDistcurve = (amount: number): Float32Array => {
    // function for creating the distortion curve for waveshapers

    // This function only changes volume, but does not seem to actually distort?

    // const n_samples = 500; // dont need 41K samples
    // const curve = new Float32Array(n_samples);
    // const deg = Math.PI / 180;

    // for (let i = 0; i < n_samples; i++) {
    //   const x = (i * 2) / n_samples - 1;
    //   curve[i] = (3 + amount / 10) * x * 20 * deg;
    // }
    // return curve;

    // ----------------------------------------------

    const k = amount;
    const n_samples = 500;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; i++) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
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
    settingsTracksData![currentTrackIdx].moduleCount += 1;
  };

  const insertAudioNode = (
    audioNodes: AudioNode[][][] | undefined,
    tempAudioNode: AudioNode,
    currentTrackIdx: number
  ) => {
    let tempAudioNodesSubArr: AudioNode[][] = audioNodes![currentTrackIdx];

    for (let i = 1; i < tempAudioNodesSubArr!.length - 1; i++) {
      // ignore  audioBufferSourceNode and last gainNode subArrays
      if (i === tempAudioNodesSubArr!.length - 2) {
        // if on last sub-array and still not inserted

        if (i === 1) {
          // If on 1st array that is not reserved for audioBufferSourceNode
          if (
            tempAudioNodesSubArr![tempAudioNodesSubArr!.length - 2].length < 2
          ) {
            tempAudioNodesSubArr![tempAudioNodesSubArr!.length - 2].push(
              tempAudioNode
            );
            break;
          } else {
            tempAudioNodesSubArr!.splice(
              tempAudioNodesSubArr!.length - 1,
              0,
              []
            );
            tempAudioNodesSubArr![tempAudioNodesSubArr!.length - 2].push(
              tempAudioNode
            );
            break;
          }
        } else {
          if (
            tempAudioNodesSubArr![tempAudioNodesSubArr!.length - 2].length < 3
          ) {
            tempAudioNodesSubArr![tempAudioNodesSubArr!.length - 2].push(
              tempAudioNode
            );
            break;
          } else {
            tempAudioNodesSubArr!.splice(
              tempAudioNodesSubArr!.length - 1,
              0,
              []
            );
            tempAudioNodesSubArr![tempAudioNodesSubArr!.length - 2].push(
              tempAudioNode
            );
            break;
          }
        }
      }

      if (i === 1) {
        // If on 1st array that is not reserved for audioBufferSourceNode
        if (tempAudioNodesSubArr![i].length < 2) {
          // insert an audioNodeHere
          tempAudioNodesSubArr![i].push(tempAudioNode!);
          break;
        } else {
          continue;
        }
      } else {
        if (tempAudioNodesSubArr![i].length < 3) {
          // insert an audioNodeHere
          tempAudioNodesSubArr![i].push(tempAudioNode!);
          break;
        } else {
          continue;
        }
      }
    }

    audioNodes![currentTrackIdx] = tempAudioNodesSubArr;
    return audioNodes;
  };

  const addAudioNode = (data: Object) => {
    // add the audioNode to process audio data (2nd subarray only allows 2 audioNodes to synchronize with audioModules)

    if (audioNodes === undefined) {
      console.log("cannot add node to undefined audio nodes!");
      return;
    }

    let tempAudioNodeSubArr = audioNodes[currentTrackIdx];

    if (tempAudioNodeSubArr!.length === 2) {
      // if only audioBufferSource and gain, create empty array for extra nodes
      tempAudioNodeSubArr?.splice(1, 0, []);
      // console.log(tempAudioNodes);
    }

    let tempAudioNode: AudioNode;

    switch (
      data.type // crete audioNode based on module Object type and information
    ) {
      case "Highpass":
        tempAudioNode = aCtx!.createBiquadFilter();
        tempAudioNode.type = "highpass";
        tempAudioNode.frequency.value = data.frequency;
        tempAudioNode.Q.value = data.resonance;
        insertAudioNode(audioNodes, tempAudioNode, currentTrackIdx);
        setAudioNodes(audioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      case "Lowpass":
        tempAudioNode = aCtx!.createBiquadFilter();
        tempAudioNode.type = "lowpass";
        tempAudioNode.frequency.value = data.frequency;
        tempAudioNode.Q.value = data.resonance;
        insertAudioNode(audioNodes, tempAudioNode, currentTrackIdx);
        setAudioNodes(audioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      case "Peak":
        tempAudioNode = aCtx!.createBiquadFilter();
        tempAudioNode.type = "peaking";
        tempAudioNode.frequency.value = data.frequency;
        tempAudioNode.Q.value = data.resonance;
        tempAudioNode.gain.value = data.gain;
        insertAudioNode(audioNodes, tempAudioNode, currentTrackIdx);
        setAudioNodes(audioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      case "Reverb":
        tempAudioNode = aCtx!.createConvolver();
        tempAudioNode.buffer = impulseBuffers[data.impulse];
        insertAudioNode(audioNodes, tempAudioNode, currentTrackIdx);
        setAudioNodes(audioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      case "Waveshaper":
        tempAudioNode = aCtx!.createWaveShaper();
        tempAudioNode.curve = generateDistcurve(data.amount);
        insertAudioNode(audioNodes, tempAudioNode, currentTrackIdx);
        setAudioNodes(audioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      case "Gain":
        tempAudioNode = aCtx!.createGain();
        tempAudioNode.gain.value = data.amount;
        insertAudioNode(audioNodes, tempAudioNode, currentTrackIdx);
        setAudioNodes(audioNodes);
        setTimeout(() => {
          setAudioNodesChanged(true);
        }, 10);
        break;
      default:
        console.log("Invalid audioNode type added!");
        return;
    }
  };

  const deleteAudioModuleAndNode = (position: number[]) => {
    // position is position of audio module
    let tempAudioModules = [...audioModules]; // NOTE : Changed this to be a deep copy...
    tempAudioModules[position[0]].splice(position[1], 1); // works

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

    let tempAudioNodesSubArr = audioNodes![currentTrackIdx];
    let tempAudioNodesLinearArr: AudioNode[] = [];

    for (let i = 1; i < tempAudioNodesSubArr!.length - 1; i++) {
      for (let j = 0; j < tempAudioNodesSubArr![i].length; j++) {
        if (i === row && j === column) {
          // skip node to be deleted
          continue;
        }
        tempAudioNodesLinearArr.push(tempAudioNodesSubArr![i][j]);
      }
    }

    let audioSourceBufferNodeSubArr = [...tempAudioNodesSubArr![0]];
    let gainNodeSubArr = [
      ...tempAudioNodesSubArr![tempAudioNodesSubArr!.length - 1],
    ];

    let tempNewAudioNodesSubArr = [
      audioSourceBufferNodeSubArr,
      [],
      gainNodeSubArr,
    ];

    audioNodes![currentTrackIdx] = tempNewAudioNodesSubArr;

    for (let i = 0; i < tempAudioNodesLinearArr.length; i++) {
      insertAudioNode(audioNodes, tempAudioNodesLinearArr[i], currentTrackIdx);
    }

    settingsTracksData![currentTrackIdx].moduleCount -= 1;
    setAudioNodes(audioNodes);
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

    // Moving audioNode

    // moving audioNodes
    /*
      Operating under the assumption that if audioModules can be moved,
      then audioNodes can be moved as well. Will not re-conduct the checks
      performed above for the audioNodes
    */

    let tempAudioNodes = audioNodes![currentTrackIdx];

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

    setAudioNodes(audioNodes);
  };

  const editAudioNodeData = (data: Object, position: number[]) => {
    let tempAudioNodesSubArr = audioNodes![currentTrackIdx];

    // Offset row and column to account for structure of audioNodes array
    let row = position[0] + 1;
    let column = position[1];

    if (row === 1) {
      column -= 1;
    }

    // console.log(tempAudioNodes![position[0] + 1][position[1]]);
    // console.log(tempAudioNodes, row, column);

    if (
      data.type === "Highpass" ||
      data.type === "Lowpass" ||
      data.type === "Peak"
    ) {
      tempAudioNodesSubArr![row][column].frequency.value = data.frequency;
      tempAudioNodesSubArr![row][column].Q.value = data.resonance;
      if (data.type === "Peak") {
        tempAudioNodesSubArr![row][column].gain.value = data.gain;
      }
    } else if (data.type === "Reverb") {
      tempAudioNodesSubArr![row][column].buffer = impulseBuffers![data.impulse];
    } else if (data.type === "Waveshaper") {
      tempAudioNodesSubArr![row][column].curve = generateDistcurve(data.amount);
    } else if (data.type === "Gain") {
      tempAudioNodesSubArr![row][column].gain.value = data.amount;
    } else if (data.type === "TrackChange") {
      // currentTrackIdx is changed in AudioSettingsTrack, which should automatically update currently selected track
    }

    setAudioNodes(audioNodes);

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
    } else if (type === "Peak") {
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].frequency = 10000;
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].resonance = 1;
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].gain = 15;
    } else if (type === "Reverb") {
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].impulse = 1;
    } else if (type === "Waveshaper") {
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].amount = 1;
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].curve = 1;
    } else if (type === "Gain") {
      tempAudioModulesData[moduleIndex[0]][moduleIndex[1]].amount = 1.0;
    } else {
      console.log("Unsupported module type added!");
      return;
    }

    addAudioNode(tempAudioModulesData[moduleIndex[0]][moduleIndex[1]]);
    setAudioModules(tempAudioModulesData);
  };

  const saveConfiguration = async (name: string): Promise<boolean> => {
    /*
    audioModulesJSON is an array of JSON objects. Each JSON object
    within audioModulesJSON is a stringified 2d array of audioModules
    for a given track. The audioModulesJSON will ITSELF be stringified 
    before being stored in the DB.

    To unpack data payload:
      Parse audioModulesJSON object -> array of JSON Object
      parse audioModulesJson[index] -> 2d audioModules Object
    */

    // TODO : Remove return statement after testing is completed

    audioModulesJSON[currentTrackIdx] = JSON.stringify(audioModules); // save current track's audioModules as JSON

    let tempData = [];

    // remove any "new" type modules before saving.
    for (let i = 0; i < audioModulesJSON.length; i++) {
      let tempAudioModules = JSON.parse(audioModulesJSON[i]);

      let lastRow = tempAudioModules.length - 1;
      let lastColumn = tempAudioModules[lastRow].length - 1;

      if (tempAudioModules[lastRow][lastColumn].type === "New") {
        tempAudioModules[lastRow].splice(lastColumn, 1);

        if (tempAudioModules[lastRow].length === 0) {
          tempAudioModules.splice(lastRow, 1);
        }
      }

      audioModulesJSON[i] = JSON.stringify(tempAudioModules);

      tempData.push(JSON.parse(audioModulesJSON[i]));
    }

    const configuration = {
      data: tempData,
    };

    const tempBody = {
      songId: songData.id,
      chainName: name,
      data: JSON.stringify(configuration),
    };

    let response = await fetch(`http://localhost:8005/chain/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Required in order to server to receive req body
        authorization: `Bearer ${authContext.user.token}`,
      },
      body: JSON.stringify(tempBody),
    });

    if (response.ok) {
      // const json = await response.json();
      setIsUserSongPayloadSet(false); // trigger refetching if user song data from backend
      return true;
    } else {
      return false;
    }

    /*
    example of a saved configuration (make sure to add ` before and after JSON string below)
    {"data":[[[{"type":"Blank"},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0},{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0}],[{"type":"New"}]],[[{"type":"Blank"},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0},{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0}],[{"type":"New"}]],[[{"type":"Blank"},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0},{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0}],[{"type":"Reverb","isEnabled":true,"impulse":0}]],[[{"type":"Blank"}]],[[{"type":"Blank"}]],[[{"type":"Blank"}]]]}
    */
  };

  let sleep = (seconds: number): Promise<void> => {
    // sleeping utility function
    return new Promise((res, rej) => {
      setTimeout(() => {
        res();
      }, seconds * 1000);
    });
  };

  // const clearConfiguration = async () => {
  //   audioModulesJSON[currentTrackIdx] = JSON.stringify(audioModules);
  //   setAudioModulesJSON(audioModulesJSON);
  //   await sleep(1);

  //   for (let i = 0; i < audioModulesJSON.length; i++) {
  //     // save modules before switching over
  //     setCurrentTrackIdx(i);
  //     setAudioModules(JSON.parse(audioModulesJSON[i]));
  //     await sleep(2);

  //     // let tempObject = {
  //     //   type: "TrackChange",
  //     // };

  //     // editAudioNodeData(tempObject, []);
  //     // await sleep(0.5);

  //     // get module count
  //     let moduleCount = 0;

  //     for (let j = 0; j < audioModules.length; j++) {
  //       for (let k = 0; k < audioModules[j].length; k++) {
  //         if (audioModules[j][k]) {
  //           moduleCount++;
  //         }
  //       }
  //     }

  //     for (let j = 0; j < moduleCount - 1; j++) {
  //       console.log("Deleting audioNode... ------------");
  //       deleteAudioModuleAndNode([0, 1]);
  //       await sleep(2);
  //     }
  //   }
  // };

  const loadConfiguration = async (payload: string): Promise<boolean> => {
    const sleepFactor = 0.2; // Require sleeping to avoid audioModules undefined error when reconnecting audioNodes

    try {
      /*  
      Sleeping is required to avoid bug where there is a mismatch between the audioNodes and audioModules
      when the useReconnectNodes hook is executed (which is quite often).
      */

      // Setting the audioModulesJSON, audioNodes, and audioModules to their initial state works for clearing previous config
      setAudioModulesJSON(initAudioModulesJSON);
      setAudioNodes(initAudioNodes);
      setAudioModules(JSON.parse(initAudioModulesJSON[0]));
      await sleep(sleepFactor);

      // await clearConfiguration();

      // let parsedConfig = JSON.parse(
      //   // Test configuration
      //   `{"data":[[[{"type":"Blank"},{"type":"Highpass","isEnabled":true,"frequency":"265","resonance":"13"},{"type":"Lowpass","isEnabled":true,"frequency":"10483","resonance":"20"}],[{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0},{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0},{"type":"Reverb","isEnabled":true,"impulse":"1"}]],[[{"type":"Blank"},{"type":"Highpass","isEnabled":true,"frequency":"1905","resonance":"15"},{"type":"Lowpass","isEnabled":true,"frequency":"6852","resonance":"9"}],[{"type":"Reverb","isEnabled":true,"impulse":"2"},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0},{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0}],[{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0}]],[[{"type":"Blank"},{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0}],[{"type":"Reverb","isEnabled":true,"impulse":"3"},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0},{"type":"Reverb","isEnabled":true,"impulse":0}]],[[{"type":"Blank"}]],[[{"type":"Blank"},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0},{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0}],[{"type":"Reverb","isEnabled":true,"impulse":"8"},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0},{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0}]],[[{"type":"Blank"},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0},{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0}],[{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0},{"type":"Reverb","isEnabled":true,"impulse":"2"},{"type":"Highpass","isEnabled":true,"frequency":20,"resonance":0}],[{"type":"Lowpass","isEnabled":true,"frequency":21000,"resonance":0}]]]}`
      // );

      let parsedConfig = JSON.parse(payload);

      for (let i = 0; i < parsedConfig.data.length; i++) {
        currentTrackIdx! = i;
        setCurrentTrackIdx(i);
        await sleep(sleepFactor);

        let config = parsedConfig.data[i];
        setAudioModules(config);
        await sleep(sleepFactor);

        let tempAudioNodesSubArr = audioNodes![currentTrackIdx];

        while (tempAudioNodesSubArr.length > 2) {
          tempAudioNodesSubArr?.splice(1, 1); // delete all previous audioNodes EXCEPT AudioBufferSourceNode and gainNode
        }

        audioNodes![currentTrackIdx] = tempAudioNodesSubArr;
        setAudioNodes(audioNodes);
        await sleep(sleepFactor);

        // setAudioNodes(tempAudioNodes); // set cleared audioNodes before adding configured ones
        // above line of code is not requires because audioNodes will be changed by reference
        settingsTracksData![currentTrackIdx].moduleCount = 0;

        let addNewAudioNodes = async () => {
          // Config is equivalent to the current audioModules
          for (let k = 0; k < config.length; k++) {
            for (let j = 0; j < config[k].length; j++) {
              if (k === 0 && j === 0) {
                // skip blank module
                continue;
              }

              if (config[k][j].type === "New") {
                // dont add the new module as an audioNode
                break;
              }
              settingsTracksData![currentTrackIdx].moduleCount += 1;
              addAudioNode(config[k][j]); // add configured audio nodes
              await sleep(sleepFactor);
            }
          }
        };

        await addNewAudioNodes();

        // save current audio module configuration
        audioModulesJSON[currentTrackIdx] = JSON.stringify(config);
      }
      setAudioModulesJSON(audioModulesJSON);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const deleteConfiguration = async (chainId: string): Promise<boolean> => {
    let response = await fetch(`http://localhost:8005/chain/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json", // Required in order to server to receive req body
        authorization: `Bearer ${authContext.user.token}`,
      },
      body: JSON.stringify({
        chainId: chainId,
      }),
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
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
      <div style={MasterContainerStyle}>
        <div style={SongDataContainerStyle}>
          <div style={SongDataContainerElementStyle}>
            <h1
              style={{
                fontSize: "15px",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              Title: {songData.title}
            </h1>
          </div>
          <div style={SongDataContainerElementStyle}>
            <h1
              style={{
                fontSize: "15px",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              Description: {songData.description}
            </h1>
          </div>
        </div>
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
            songChains={songData.chains}
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
            deleteConfiguration={deleteConfiguration}
            editAudioNodeData={editAudioNodeData}
            setAudioNodesChanged={setAudioNodesChanged}
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
            useAttachEventListener={useAttachEventListener}
          ></AudioController>
        </div>
      </div>
    </>
  );
};

export default AudioBox;
