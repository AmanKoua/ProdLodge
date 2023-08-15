import CSS from "csstype";
import playButton from "../assets/playButton.png";
import pauseButton from "../assets/pauseButton.png";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

let audioControllerElement: HTMLDivElement;
let audioControllerRef: any;
let eventListenerAttached: boolean = false;
let audioControllerElementWidth: number;

let audioControlImageElement: HTMLImageElement;
let audioControlImageRef: any;

interface Props {
  hasUserGestured: boolean;
  isPlaying: boolean;
  isExpanded: boolean;
  songTime: number;
  songDuration: number;
  areAudioNodesReady: boolean;
  setIsPlaying: (val: boolean) => void;
  setIsExpanded: (val: boolean) => void;
  playSong: (val: number | null) => void;
  stopSong: () => void;
  setSongTime: (val: number) => void;
  startVisualizer: () => void;
}

const AudioController = ({
  hasUserGestured,
  isPlaying,
  isExpanded,
  songTime,
  songDuration,
  areAudioNodesReady,
  setIsPlaying,
  setIsExpanded,
  playSong,
  stopSong,
  setSongTime,
  startVisualizer,
}: Props) => {
  // const [songTimeWidth, setSongTimeWidth] = useState(0);
  const [isHover, setIsHover] = useState(false);
  audioControllerRef = useRef<HTMLDivElement | null>(null);
  audioControllerElement = audioControllerRef.current;

  useEffect(() => {
    // attach eventHandler to AudioControllerDiv

    if (!hasUserGestured || !areAudioNodesReady) {
      return;
    }

    const handleAudioControllerClick = async (event: MouseEvent) => {
      if (event.target === audioControllerRef.current) {
        let x = event.clientX;
        let left = audioControllerElement.getBoundingClientRect().left;
        let right = audioControllerElement.getBoundingClientRect().right;
        let width = right - left;
        let position = (x - left) / width; // position percentage

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

    startVisualizer();
  }, [songDuration]);

  const AudioControllerStyle: CSS.Properties = {
    position: "absolute",
    bottom: "0px",
    width: "100%",
    height: "40px",
    border: "1px solid black",
    // zIndex: -1,
  };

  const imgStyle: CSS.Properties = {
    width: "30px",
    marginTop: "5px",
    marginLeft: "5px",
    zIndex: "5",
  };

  const ExpandButtonStyle: CSS.Properties = {
    position: "absolute",
    marginLeft: "45%",
    width: "10%",
    height: "15px",
    border: "1px solid black",
    borderRadius: "6px",
    fontSize: "10px",
    textAlign: "center",
    backgroundColor: "lavender",
    opacity: isHover ? "100%" : "45%",
  };

  const SongTimeDivStyle: CSS.Properties = {
    position: "absolute",
    bottom: "0px",
    width: "50%",
    height: "4px",
    backgroundColor: "#3d8bf2",
    opacity: "35%",
    zIndex: "10", // needs to be above canvas!
  };

  const getSongTimeDivWidth = (): number => {
    let SongTimeDivStyleWidth = (songTime / songDuration) * 100;

    if (SongTimeDivStyleWidth > 100) {
      SongTimeDivStyleWidth = 100;
    }

    return SongTimeDivStyleWidth;
  };

  SongTimeDivStyle.width = `${getSongTimeDivWidth()}%`;

  const handleImageClick = async () => {
    if (!hasUserGestured || !areAudioNodesReady) {
      // wait unitl audio nodes are initialized!
      return;
    }

    if (!isPlaying) {
      await playSong(null);
    } else {
      stopSong();
      // startVisualizer();
    }
    setIsPlaying(!isPlaying);
    startVisualizer();
  };

  const imgSrc = isPlaying ? pauseButton : playButton;
  const expansionText = isExpanded ? "Close" : "Open";

  const handleMouseEnterExpandButton = () => {
    setIsHover(true);
  };

  const handleMouseLeaveExpandButton = () => {
    setIsHover(false);
  };

  return (
    <>
      <div style={AudioControllerStyle} ref={audioControllerRef}>
        <div
          style={ExpandButtonStyle}
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
          onMouseEnter={handleMouseEnterExpandButton}
          onMouseLeave={handleMouseLeaveExpandButton}
        >
          {expansionText}
        </div>
        <div style={SongTimeDivStyle}></div>
        <img
          ref={audioControlImageRef}
          src={imgSrc}
          style={imgStyle}
          onClick={handleImageClick}
        />
      </div>
    </>
  );
};

export default AudioController;
