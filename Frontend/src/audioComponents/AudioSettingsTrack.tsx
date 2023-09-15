import { useRef } from "react";
import CSS from "csstype";

import { TrackData } from "../customTypes";

interface Props {
  settingsTracksData: TrackData[] | undefined;
  audioModulesJSON: string[];
  audioModules: Object[][];
  idx: number;
  currentTrackIdx: number;
  setAudioModulesJSON: (val: string[]) => void;
  setAudioModules: (val: Object[][]) => void;
  setCurrentTrackIdx: (val: any) => void;
  editAudioNodeData: (data: Object, position: number[]) => void;
  setSettingsTracksData: (val: any) => void;
  setAudioNodesChanged: (val: any) => void;
}

const AudioSettingsTrack = ({
  settingsTracksData,
  audioModulesJSON,
  audioModules,
  idx,
  currentTrackIdx,
  setAudioModulesJSON,
  setAudioModules,
  setCurrentTrackIdx,
  editAudioNodeData,
  setSettingsTracksData,
  setAudioNodesChanged,
}: Props) => {
  let AudioSettingsTrackDiv = useRef(null);
  let IsEnabledButtonDiv = useRef(null);

  const AudioSettingsTrackStyle: CSS.Properties = {
    border: currentTrackIdx === idx ? "2px solid black" : "1px solid black",
    opacity: settingsTracksData![idx].isEnabled ? "100%" : "40%",
  };

  const TrackNameStyle: CSS.Properties = {
    float: "left",
    marginLeft: "15px",
    width: "30%",
    height: "90%",
    overflow: "hidden",
    // backgroundColor: "green",
  };

  const AudioModulesCountStyle: CSS.Properties = {
    // backgroundColor: "green",
    float: "left",
    marginLeft: "15px",
    marginTop: "4px",
    width: settingsTracksData![idx].moduleCount === 0 ? "0%" : "20%",
    // backgroundColor: "red",
  };

  const IsEnabledButton: CSS.Properties = {
    backgroundColor: settingsTracksData![idx].isEnabled ? "#16fa19" : "red",
    zIndex: "1",
  };

  const generateModuleCountText = (): string => {
    if (settingsTracksData![idx].moduleCount === 0) {
      return "";
    } else {
      return `Modules : ${settingsTracksData![idx].moduleCount} `;
    }
  };

  const handleTrackChange = async (event: any) => {
    if (event.target === IsEnabledButtonDiv.current) {
      return;
    }

    if (currentTrackIdx != idx) {
      // save modules before switching over
      let tempAudioModulesJSON = [...audioModulesJSON];
      tempAudioModulesJSON[currentTrackIdx] = JSON.stringify(audioModules);
      setAudioModulesJSON(tempAudioModulesJSON);
      setCurrentTrackIdx(idx);
      setTimeout(() => {
        setAudioModules(JSON.parse(audioModulesJSON[idx]));
      }, 10);
    }

    let tempObject = {
      type: "TrackChange",
      track: idx,
    };

    setTimeout(() => {
      editAudioNodeData(tempObject, []);
    }, 10);
  };

  let handleToggleEnabledButtonClick = () => {
    settingsTracksData![idx].isEnabled = !settingsTracksData![idx].isEnabled;
    setAudioNodesChanged(true); // setAudioNodesChanged true to trigger reconnection!
  };

  return (
    <div
      onClick={handleTrackChange}
      ref={AudioSettingsTrackDiv}
      style={AudioSettingsTrackStyle}
      className="w-11/12 h-6 m-2 z-50 rounded-lg flex"
    >
      <div
        onClick={handleToggleEnabledButtonClick}
        style={IsEnabledButton}
        className="w-1/12 h-5/6 mt-auto mb-auto rounded-xl mr-1 ml-1 z-0"
        ref={IsEnabledButtonDiv}
      ></div>

      <p className="w-5/12 h-full pl-2 overflow-hidden z-0">
        {settingsTracksData![idx].name}
      </p>
      <div className="  w-5/12 ml-2 overflow-hidden z-0">
        {generateModuleCountText()}
      </div>
    </div>
  );
};

export default AudioSettingsTrack;
