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
  saveConfiguration: (name: string) => Promise<boolean>;
  loadConfiguration: (payload: string) => Promise<boolean>;
  deleteConfiguration: (chainId: string) => Promise<boolean>;
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
  deleteConfiguration,
  editAudioNodeData,
  setAudioNodesChanged,
}: Props) => {
  const [isConfigSettingOpen, setIsConfigSettingsOpen] = useState(false);
  const [configDivStyleHeight, setConfigDivStyleHeight] = useState("30px");
  const [isSaveConfig, setIsSaveConfig] = useState(false);
  const [configName, setConfigName] = useState("");
  const [songChainIdx, setSongChainIdx] = useState("invalid");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  // ConfigurationsDivStyle.height = isConfigSettingOpen ? "115px" : "30px";
  ConfigurationsDivStyle.height = configDivStyleHeight;

  const calcConfigDivHeight = () => {
    if (isConfigSettingOpen && !error && !message) {
      setConfigDivStyleHeight("115px");
    } else if (isConfigSettingOpen && error && message) {
      // both err and message
      setConfigDivStyleHeight("205px");
    } else if (isConfigSettingOpen && (error || message)) {
      // err or message but not both
      setConfigDivStyleHeight("145px");
    } else {
      setConfigDivStyleHeight("30px");
    }
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
    // backgroundColor: "blue",
    zIndex: "2",
  };

  const ActionButtonStyle: CSS.Properties = {
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

  const CustomActionButtonStyle: CSS.Properties = {
    // have 2 action buttons side by side
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

  const ConfigurationOptionsStyle: CSS.Properties = {
    position: "absolute",
    marginTop: "30px",
    width: "100%",
    height: "120px",
    // backgroundColor: "red",
  };

  SettingsDrawerStyle.marginLeft = isSettingsExpanded ? "30%" : "100%";

  const ErrorMessageStyle: CSS.Properties = {
    width: "80%",
    textAlign: "center",
    marginTop: "35px",
    marginLeft: "10%",
    border: "2px solid red",
    backgroundColor: "#f59a9a",
  };

  const MessageStyle: CSS.Properties = {
    width: "80%",
    textAlign: "center",
    marginTop: "35px",
    marginLeft: "10%",
    border: "2px solid green",
    backgroundColor: "#c4ffc4",
  };

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
          style={{ width: "65%", marginLeft: "17.5%", marginTop: "15px" }}
        />
        <div
          style={ActionButtonStyle}
          onClick={async () => {
            setMessage("");
            setError("");

            let ok = await saveConfiguration(configName);

            if (ok) {
              setMessage("Configuration saved!");
            } else {
              setError("Error saving configuration!");
            }

            calcConfigDivHeight();
          }}
        >
          Save Configuration
        </div>
        {error && <div style={ErrorMessageStyle}>{error}</div>}
        {message && <div style={MessageStyle}>{message}</div>}
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
          style={{ width: "65%", marginLeft: "17.5%", marginTop: "15px" }}
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
          style={CustomActionButtonStyle}
          onClick={async () => {
            if (songChainIdx === "invalid") {
              // do not load this configuration
              return;
            } else {
              setError("");
              setMessage("");

              let ok = await loadConfiguration(songChains[songChainIdx].data);

              if (ok) {
                setMessage("Configuration Loaded!");
              } else {
                setError("Configuration loading failed!");
              }

              calcConfigDivHeight();
            }
          }}
        >
          Load Configuration
        </div>
        <div
          style={CustomActionButtonStyle}
          onClick={async () => {
            setMessage("");
            setError("");

            if (songChainIdx === "invalid") {
              // ignore
              return;
            }

            const ok = await deleteConfiguration(songChains[songChainIdx].id);

            if (ok) {
              setMessage("Configuration Deleted!");
            } else {
              setError("Error deleting configuration!");
            }
          }}
        >
          Delete Configuration
        </div>
        {error && <div style={ErrorMessageStyle}>{error}</div>}
        {message && <div style={MessageStyle}>{message}</div>}
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
          onClick={() => {
            setIsSaveConfig(true);
            setIsConfigSettingsOpen(!isConfigSettingOpen);
            // openSaveConfigSettings();
            calcConfigDivHeight();
          }}
        >
          Save Configuration
        </div>
        <div
          style={ConfigurationButtonStyle}
          onClick={() => {
            setIsSaveConfig(false);
            setIsConfigSettingsOpen(!isConfigSettingOpen);
            // openLoadConfigSettings();
            calcConfigDivHeight();
          }}
        >
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
