import { useRef } from "react";
import CSS from "csstype";

interface Props {
  settingsTracksData: Object[] | undefined;
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

  const AudioSettingsTrackStyle: CSS.Properties = {
    position: "relative",
    marginTop: "12px",
    width: "100%",
    height: "35px",
    borderRadius: "100px",
    border: currentTrackIdx === idx ? "3px solid black" : "1px solid black",
    opacity: settingsTracksData![idx].isEnabled ? "100%" : "40%",
    // backgroundColor: "blanchedalmond",
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
    position: "absolute",
    marginLeft: "30%",
    marginTop: "7.5px",
    width: "20px",
    height: "20px",
    borderRadius: "25px", // turn div into a circle
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
    if (event.target != AudioSettingsTrackDiv.current) {
      return;
    }

    // console.log(idx);
    // console.log(currentTrackIdx);
    // console.log(audioModules);
    // console.log(audioModulesJSON);

    if (currentTrackIdx != idx) {
      // save modules before switching over
      let tempAudioModulesJSON = [...audioModulesJSON];
      tempAudioModulesJSON[currentTrackIdx] = JSON.stringify(audioModules);
      setAudioModulesJSON(tempAudioModulesJSON);
      setCurrentTrackIdx(idx);
      setTimeout(() => {
        setAudioModules(JSON.parse(audioModulesJSON[idx]));
      }, 10);

      // console.log(idx + " -------- ");
      // console.log(currentTrackIdx + " -------- ");
      // console.log(JSON.parse(audioModulesJSON[idx]));
      // console.log(audioModules + " -------- ");
      // console.log(audioModulesJSON + " -------- ");
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
      style={AudioSettingsTrackStyle}
      onClick={handleTrackChange}
      ref={AudioSettingsTrackDiv}
    >
      <p style={TrackNameStyle}>{settingsTracksData![idx].name}</p>
      <div
        style={IsEnabledButton}
        onClick={handleToggleEnabledButtonClick}
      ></div>
      <div style={AudioModulesCountStyle}>{generateModuleCountText()}</div>
    </div>
  );
};

export default AudioSettingsTrack;
