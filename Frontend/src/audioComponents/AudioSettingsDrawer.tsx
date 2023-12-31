import { useState, useEffect } from "react";
import CSS from "csstype";
import AudioSettingsTrack from "./AudioSettingsTrack";
import "../invisibleScrollbar.css";

import { Chain, TrackData } from "../customTypes";

interface Props {
  songChains: Chain[];
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
  const [songChainIdx, setSongChainIdx] = useState(-1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Clear error and message after a set time period of being displayed

    if (!message && !error) {
      return;
    }

    let temp = setTimeout(() => {
      setError("");
      setMessage("");
    }, 5000);

    return () => {
      clearTimeout(temp);
    };
  }, [message, error]);

  const SettingsDrawerStyle: CSS.Properties = {
    position: "absolute",
    marginLeft: "95%",
    width: "70%",
    height: "68%",
    backgroundColor: "#edf4fc",
    transition: "all 0.3s", // for expansion and contraction
    borderRadius: "15px",
    overflow: "scroll",
    overflowX: "hidden",
    border: "1px solid black",
    // backdropFilter: "blur(10px)", // wont work :(
    // WebkitBackdropFilter: "blur(13px)",
    zIndex: "1",
  };

  SettingsDrawerStyle.marginLeft = isSettingsExpanded ? "30%" : "100%";

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

  ConfigurationsDivStyle.height = isConfigSettingOpen
    ? error || message
      ? "180px"
      : "100px"
    : "30px";

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
    overflow: "hidden",
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
    overflow: "hidden",
    zIndex: "2",
  };

  const ConfigurationOptionsStyle: CSS.Properties = {
    position: "absolute",
    marginTop: "30px",
    width: "100%",
    height: "120px",
    // backgroundColor: "red",
  };

  const ErrorMessageStyle: CSS.Properties = {
    width: "80%",
    textAlign: "center",
    marginTop: "35px",
    marginLeft: "10%",
    border: "2px solid red",
    backgroundColor: "#f59a9a",
  };

  ErrorMessageStyle.marginTop = message ? "35px" : "55px";

  const MessageStyle: CSS.Properties = {
    width: "80%",
    textAlign: "center",
    marginTop: "10px",
    marginLeft: "10%",
    border: "2px solid green",
    backgroundColor: "#c4ffc4",
  };

  MessageStyle.marginTop = error ? "10px" : "55px";

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

            if (!configName) {
              setError("Cannot save configuration without name!");
              return;
            }

            if (configName.length > 25) {
              setError(
                `Config name too long (limit 25, current ${configName.length})`
              );
              return;
            }

            let ok = await saveConfiguration(configName);

            if (ok) {
              setMessage("Configuration saved!");
            } else {
              setError("Error saving configuration!");
            }

            // calcConfigDivHeight();
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
            setSongChainIdx(parseInt(e.target.value));
          }}
          style={{ width: "65%", marginLeft: "17.5%", marginTop: "15px" }}
        >
          <option key={-1} value={-1}>
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
            if (songChainIdx === -1) {
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

              // calcConfigDivHeight();
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

            if (songChainIdx === -1) {
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
              settingsTracksData={settingsTracksData as TrackData[]}
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
    <div style={SettingsDrawerStyle} className=" hide-scrollbar">
      <div style={ConfigurationsDivStyle}>
        <div
          style={ConfigurationButtonStyle}
          onClick={() => {
            if (isSaveConfig) {
              setIsConfigSettingsOpen(!isConfigSettingOpen);
            } else {
              setIsSaveConfig(true);
            }

            // openSaveConfigSettings();
            // calcConfigDivHeight();
          }}
        >
          Save Configuration
        </div>
        <div
          style={ConfigurationButtonStyle}
          onClick={() => {
            if (!isSaveConfig) {
              setIsConfigSettingsOpen(!isConfigSettingOpen);
            } else {
              setIsSaveConfig(false);
            }

            // openLoadConfigSettings();
            // calcConfigDivHeight();
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
