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
}: Props) => {
  let AudioSettingsTrackDiv = useRef(null);

  const AudioSettingsTrackStyle: CSS.Properties = {
    position: "relative",
    marginTop: "8px",
    width: "100%",
    height: "35px",
    border: "1px solid black",
    opacity: settingsTracksData![idx].isEnabled ? "100%" : "40%",
    // backgroundColor: "blanchedalmond",
  };

  const TrackNameStyle: CSS.Properties = {
    // backgroundColor: "green",
    float: "left",
    marginLeft: "15px",
    width: "15%",
  };

  const IsEnabledButton: CSS.Properties = {
    position: "absolute",
    marginLeft: "15%",
    marginTop: "7.5px",
    width: "20px",
    height: "20px",
    borderRadius: "25px", // turn div into a circle
    backgroundColor: settingsTracksData![idx].isEnabled ? "#16fa19" : "red",
    zIndex: "1",
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
    console.log(settingsTracksData![idx]);
    settingsTracksData![idx].isEnabled = !settingsTracksData![idx].isEnabled;
    // Will not use setSettingsTracksData because settingsTracksData is modified by reference
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
    </div>
  );
};

export default AudioSettingsTrack;
