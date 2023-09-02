import { useState } from "react";
import CSS from "csstype";
import AudioSettingsTrack from "./AudioSettingsTrack";

interface Props {
  songChains: Object[]; // [{name: ..., data: ....}]
  settingsTracksData: Object[] | undefined;
  audioModulesJSON: string[];
  audioModules: Object[][];
  isSettingsExpanded: boolean;
  currentTrackIdx: number;
  setAudioModulesJSON: (val: string[]) => void;
  setAudioModules: (val: Object[][]) => void;
  setCurrentTrackIdx: (val: any) => void;
  setSettingsTracksData: (val: any) => void;
  saveConfiguration: (name: string) => void;
  loadConfiguration: (payload: string) => void;
  editAudioNodeData: (data: Object, position: number[]) => void;
  setAudioNodesChanged: (val: any) => void;
}

const AudioSettingsDrawer = ({
  songChains,
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
  const [isConfigSettingOpen, setIsConfigSettingsOpen] = useState(false);
  const [isSaveConfig, setIsSaveConfig] = useState(false);
  const [configName, setConfigName] = useState("");
  const [songChainIdx, setSongChainIdx] = useState("invalid");

  const SettingsDrawerStyle: CSS.Properties = {
    position: "absolute",
    marginLeft: "95%",
    width: "70%",
    height: "68%",
    // backgroundColor: "#e1f5fa",
    // backgroundColor: "#d4e6fc",
    backgroundColor: "#edf4fc",
    opacity: "95%",
    transition: "all 0.3s", // for expansion and contraction
    borderRadius: "15px",
    overflow: "scroll",
    overflowX: "hidden",
    zIndex: "1",
  };

  const ConfigurationsDivStyle: CSS.Properties = {
    position: "relative",
    marginLeft: "0%",
    width: "100%",
    height: "30px",
    // backgroundColor: "orange",
    transition: "all 0.3s", // for expansion and contraction
    overflow: "hidden",
    zIndex: "1",
  };

  ConfigurationsDivStyle.height = isConfigSettingOpen ? "150px" : "30px";

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
    // backgroundColor: "blue",
    zIndex: "2",
  };

  const ActionButtonStyle: CSS.Properties = {
    // writingMode: "vertical-rl",
    position: "relative",
    float: "left",
    marginLeft: "37.5%",
    marginTop: "2%",
    width: "25%",
    height: "15px",
    border: "1px solid black",
    borderRadius: "6px",
    fontSize: "10px",
    textAlign: "center",
    // backgroundColor: "blue",
    zIndex: "2",
  };

  const ConfigurationOptionsStyle: CSS.Properties = {
    position: "absolute",
    marginTop: "30px",
    width: "100%",
    height: "120px",
    // backgroundColor: "red",
  };

  SettingsDrawerStyle.marginLeft = isSettingsExpanded ? "30%" : "100%";

  const openSaveConfigSettings = () => {
    setIsSaveConfig(true);
    setIsConfigSettingsOpen(!isConfigSettingOpen);
  };

  const openLoadConfigSettings = () => {
    setIsSaveConfig(false);
    setIsConfigSettingsOpen(!isConfigSettingOpen);
  };

  const editConfigName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfigName(e.target.value);
  };

  const generateSaveConfigMenu = (): JSX.Element => {
    let saveConfigMenu: JSX.Element = (
      <>
        <input
          type="text"
          placeholder="Config name"
          value={configName}
          onChange={editConfigName}
          style={{ width: "65%", marginLeft: "17.5%", marginTop: "35px" }}
        />
        <div
          style={ActionButtonStyle}
          onClick={() => {
            saveConfiguration(configName);
          }}
        >
          Save Configuration
        </div>
      </>
    );

    return saveConfigMenu;
  };

  const generateLoadConfigMenu = (): JSX.Element => {
    let loadConfigMenu: JSX.Element = (
      <>
        <select
          name="chainSelect"
          value={songChainIdx}
          onChange={(e) => {
            setSongChainIdx(e.target.value);
          }}
          style={{ width: "65%", marginLeft: "17.5%", marginTop: "35px" }}
        >
          <option key={-1} value={"invalid"}>
            Choose configuration
          </option>

          {songChains.map((item, idx) => {
            return (
              <option key={idx} value={idx}>
                {item.name}
              </option>
            );
          })}
        </select>
        <div
          style={ActionButtonStyle}
          onClick={async () => {
            if (songChainIdx === "invalid") {
              // do not load this configuration
              return;
            } else {
              loadConfiguration(songChains[songChainIdx].data);
            }
          }}
        >
          Load Configuration
        </div>
      </>
    );

    return loadConfigMenu;
  };

  const generateAudioSettingsTracks = (): JSX.Element => {
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
        <div
          style={ConfigurationButtonStyle}
          onClick={/*saveConfiguration*/ openSaveConfigSettings}
        >
          Save Configuration
        </div>
        <div style={ConfigurationButtonStyle} onClick={openLoadConfigSettings}>
          Load Configuration
        </div>
        <div style={ConfigurationOptionsStyle}>
          {isSaveConfig ? generateSaveConfigMenu() : generateLoadConfigMenu()}
        </div>
      </div>
      {generateAudioSettingsTracks()}
    </div>
  );
};

export default AudioSettingsDrawer;
