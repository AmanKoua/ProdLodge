import CSS from "csstype";
import playButton from "../assets/playButton.png";
import pauseButton from "../assets/pauseButton.png";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

let audioControllerElement: HTMLDivElement;
let audioControllerRef: any;
let audioControlImageRef: any;

interface Props {
  hasUserGestured: boolean;
  isPlaying: boolean;
  isVisualizing: boolean;
  isExpanded: boolean;
  isSettingsExpanded: boolean;
  songTime: number;
  songDuration: number;
  areAudioNodesReady: boolean;
  setIsPlaying: (val: boolean) => void;
  setIsExpanded: (val: boolean) => void;
  setIsSettingsExpanded: (val: boolean) => void;
  setIsAudioControllerHover: (val: boolean) => void;
  playSong: (val: number | null) => void;
  stopSong: () => void;
  setSongTime: (val: number) => void;
  startVisualizer: () => void;
  useAttachEventListener: (
    isEventHandlerAttached: boolean,
    audioControllerRef: any,
    audioControllerElement: HTMLDivElement,
    setIsEventHandlerAttached: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
}

const AudioController = ({
  hasUserGestured,
  isPlaying,
  isVisualizing,
  isExpanded,
  isSettingsExpanded,
  songTime,
  songDuration,
  areAudioNodesReady,
  setIsPlaying,
  setIsExpanded,
  setIsSettingsExpanded,
  setIsAudioControllerHover,
  playSong,
  stopSong,
  setSongTime,
  startVisualizer,
  useAttachEventListener,
}: Props) => {
  // const [songTimeWidth, setSongTimeWidth] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const [isEventHandlerAttached, setIsEventHandlerAttached] = useState(false);
  audioControllerRef = useRef(null);
  audioControllerElement = audioControllerRef.current;

  /*
    Event listener had to be attached like this to avoid bug where same event listener
    seemed to be attached to 2 seperate audioControllers (in different AudioBox components)
  */

  useAttachEventListener(
    isEventHandlerAttached,
    audioControllerRef,
    audioControllerElement,
    setIsEventHandlerAttached
  );

  const AudioControllerStyle: CSS.Properties = {
    position: "absolute",
    bottom: "0px",
    width: "100%",
    height: "40px",
    borderBottom: "1px solid #add0f7",
    transition: "all 0.3s", // for expansion and contraction
    zIndex: "2",
  };

  AudioControllerStyle.height = isExpanded ? "100px" : "40px";

  const PlaceholderStyle: CSS.Properties = {
    marginTop: isExpanded ? "30px" : "7px",
    transition: "all 0.3s",
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
    // backgroundColor: "lavender",
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
      <div
        style={AudioControllerStyle}
        ref={audioControllerRef}
        onMouseEnter={() => {
          setIsAudioControllerHover(true);
        }}
        onMouseLeave={() => {
          setIsAudioControllerHover(false);
        }}
      >
        {hasUserGestured && !isVisualizing && (
          <div
            style={PlaceholderStyle}
            className="w-full h-3/6 absolute z-0 pointer-events-none"
          >
            <p className="w-max ml-auto mr-auto text-2xl animate-pulse relative">
              Please wait, tracks are loading...
            </p>
          </div>
        )}
        <div
          style={ExpandButtonStyle}
          onClick={() => {
            if (isExpanded) {
              setIsSettingsExpanded(false);
            }
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
