import { useState, useEffect } from "react";

export let useInitAudioCtx = (
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

export let useFetchSongAndInitNodes = (
  aCtx: AudioContext | undefined,
  tempSong: string,
  setSongBuffer: (val: any) => void,
  setSongDuration: (val: any) => void,
  setAudioNodes: (val: any) => void
) => {
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
      tempAnalyserNode.fftSize = 2048;

      let tempAudioNodesArr: AudioNode[][] = [
        [tempAudioSourceNode],
        [tempAnalyserNode],
      ];

      setAudioNodes(tempAudioNodesArr);
    };

    fetchSong();
  }, [aCtx]);
};

export let useReconnectNodes = (
  aCtx: AudioContext | undefined,
  audioNodes: AudioNode[][] | undefined,
  audioNodesChanged: boolean,
  setAudioNodesChanged: (val: any) => void
) => {
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
    } else {
      // TODO : Implement here!
      // loop through audioNodes and connect them one by one
      // last one connects to dest any analyser.
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
    //   if (!audioNodesChanged) {
    //     return;
    //   }

    //   for (let i = 0; i < audioNodes.length; i++) {
    //     for (let j = 0; j < audioNodes[i].length; j++) {
    //       audioNodes[i][j].disconnect();
    //     }
    //   }
    // };
  }, [audioNodes, audioNodesChanged]);
};

export let usePlayAndResume = (
  aCtx: AudioContext | undefined,
  audioNodes: AudioNode[][] | undefined,
  songBuffer: AudioBuffer | undefined,
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

    if (aCtx === undefined) {
      return;
    }

    console.log("play / resume!");

    let tempAudioNodes = audioNodes; // I suspect that this is NOT seen as a different array upon mutation because the reference is the same
    let tempAudioSourceNode: AudioBufferSourceNode = aCtx!.createBufferSource();

    tempAudioSourceNode.buffer = songBuffer!;
    tempAudioNodes![0][0] = tempAudioSourceNode;

    setAudioNodes(tempAudioNodes);
    setAudioNodesChanged(true); // required to trigger above effect because audioNodes is a FREAKING DEEP COPY and reference does not change when mutated

    if (songTime < 0) {
      setSongTime(0);
    }

    audioNodes![0][0].start(0, songTime);
  }, [isPlaying]);
};

export let usePauseSong = (
  isPlaying: boolean,
  audioNodes: AudioNode[][] | undefined
) => {
  useEffect(() => {
    // pause when pause button clicked!
    if (isPlaying || audioNodes === undefined) {
      return;
    }
    audioNodes[0][0].stop();
  }, [isPlaying]);
};

/* 
  It seems that songTime is only passed once, and is not passed again when setSongTime is used.
  Local variable tempSongTime MUST be used!
*/

let tempSongTime = 0; // necessary for tracking song time from a custom hook

export let useTrackSongTime = (
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

    console.log("tracking song time!");

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

export let useInitVisualizer = (
  isVisualizing: boolean,
  audioNodes: AudioNode[][] | undefined,
  canvasRef: any,
  dataArr: Uint8Array | undefined,
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

    if (audioNodes === undefined) {
      console.log("canvas init dependencies undefined!");
      return;
    }

    console.log("initializing visualizer!");

    let tempDataArrSize =
      audioNodes[audioNodes.length - 1][0].frequencyBinCount;
    let tempDataArr = new Uint8Array(tempDataArrSize);

    setBufferLength(tempDataArrSize);
    setDataArr(tempDataArr);

    setTimeout(() => {
      audioNodes![audioNodes!.length - 1][0].getByteTimeDomainData(tempDataArr);
    }, 10);

    setCanvas(canvasRef.current!);

    setTimeout(() => {
      setCanvasCtx(canvasRef.current.getContext("2d"));
    }, 10);
  }, [isVisualizing]);
};
