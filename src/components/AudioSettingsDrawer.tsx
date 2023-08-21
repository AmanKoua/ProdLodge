import CSS from "csstype";
import AudioSettingsTrack from "./AudioSettingsTrack";

interface Props {
  trackNamesAndIndices: string[] | undefined;
  isSettingsExpanded: boolean;
  saveConfiguration: () => void;
  loadConfiguration: () => void;
  editAudioNodeData: (data: Object, position: number[]) => void;
}

const AudioSettingsDrawer = ({
  trackNamesAndIndices,
  isSettingsExpanded,
  saveConfiguration,
  loadConfiguration,
  editAudioNodeData,
}: Props) => {
  const SettingsDrawerStyle: CSS.Properties = {
    position: "absolute",
    marginLeft: "95%",
    width: "70%",
    height: "72%",
    // backgroundColor: "whitesmoke",
    backgroundColor: "#e1f5fa",
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
    let AudioSettingsTracks: JSX.Element = (
      <>
        {trackNamesAndIndices!.map((track, idx) => {
          return (
            <AudioSettingsTrack
              trackName={track}
              idx={idx}
              editAudioNodeData={editAudioNodeData}
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
