import CSS from "csstype";
import AudioSettingsTrack from "./AudioSettingsTrack";

interface Props {
  settingsTracksData: Object[] | undefined;
  audioModulesJSON: string[];
  audioModules: Object[][];
  isSettingsExpanded: boolean;
  currentTrackIdx: number;
  setAudioModulesJSON: (val: string[]) => void;
  setAudioModules: (val: Object[][]) => void;
  setCurrentTrackIdx: (val: any) => void;
  setSettingsTracksData: (val: any) => void;
  saveConfiguration: () => void;
  loadConfiguration: () => void;
  editAudioNodeData: (data: Object, position: number[]) => void;
  setAudioNodesChanged: (val: any) => void;
}

const AudioSettingsDrawer = ({
  settingsTracksData,
  audioModulesJSON,
  audioModules,
  isSettingsExpanded,
  currentTrackIdx,
  setAudioModulesJSON,
  setAudioModules,
  setCurrentTrackIdx,
  setSettingsTracksData,
  saveConfiguration,
  loadConfiguration,
  editAudioNodeData,
  setAudioNodesChanged,
}: Props) => {
  // console.log(audioModules);

  const SettingsDrawerStyle: CSS.Properties = {
    position: "absolute",
    marginLeft: "95%",
    width: "70%",
    height: "72%",
    // backgroundColor: "#e1f5fa",
    // backgroundColor: "#d4e6fc",
    backgroundColor: "#edf4fc",
    opacity: "95%",
    transition: "all 0.3s", // for expansion and contraction
    overflow: "scroll",
    overflowX: "hidden",
    zIndex: "1",
  };

  const ConfigurationsDivStyle: CSS.Properties = {
    position: "relative",
    marginLeft: "0%",
    width: "100%",
    height: "30px",
    // backgroundColor: "green",
    transition: "all 0.3s", // for expansion and contraction
    zIndex: "1",
  };

  const ConfigurationButtonStyle: CSS.Properties = {
    // writingMode: "vertical-rl",
    position: "relative",
    float: "left",
    marginLeft: "16%",
    marginTop: "2%",
    width: "25%",
    height: "15px",
    border: "1px solid black",
    borderRadius: "6px",
    fontSize: "10px",
    textAlign: "center",
    // backgroundColor: "red",
    zIndex: "2",
  };

  SettingsDrawerStyle.marginLeft = isSettingsExpanded ? "30%" : "100%";

  let generateAudioSettingsTracks = (): JSX.Element => {
    if (settingsTracksData === undefined) {
      return <></>;
    }

    let AudioSettingsTracks: JSX.Element = (
      <>
        {settingsTracksData!.map((trackData, idx) => {
          // CHANGE CODE HERE!
          return (
            <AudioSettingsTrack
              settingsTracksData={settingsTracksData}
              audioModulesJSON={audioModulesJSON}
              audioModules={audioModules}
              idx={idx}
              currentTrackIdx={currentTrackIdx}
              setAudioModulesJSON={setAudioModulesJSON}
              setAudioModules={setAudioModules}
              setCurrentTrackIdx={setCurrentTrackIdx}
              editAudioNodeData={editAudioNodeData}
              setSettingsTracksData={setSettingsTracksData}
              setAudioNodesChanged={setAudioNodesChanged}
              key={idx}
            ></AudioSettingsTrack>
          );
        })}
      </>
    );

    return AudioSettingsTracks;
  };

  return (
    <div style={SettingsDrawerStyle}>
      <div style={ConfigurationsDivStyle}>
        <div style={ConfigurationButtonStyle} onClick={saveConfiguration}>
          Save Configuration
        </div>
        <div style={ConfigurationButtonStyle} onClick={loadConfiguration}>
          Load Configuration
        </div>
      </div>
      {generateAudioSettingsTracks()}
    </div>
  );
};

export default AudioSettingsDrawer;
