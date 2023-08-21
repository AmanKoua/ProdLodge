import React from "react";
import CSS from "csstype";

interface Props {
  trackName: string;
  idx: number;
  editAudioNodeData: (data: Object, position: number[]) => void;
}

const AudioSettingsTrack = ({ trackName, idx, editAudioNodeData }: Props) => {
  let isEnaled = true;

  const AudioSettingsTrackStyle: CSS.Properties = {
    position: "relative",
    marginTop: "8px",
    width: "100%",
    height: "35px",
    // backgroundColor: "blanchedalmond",
  };

  const TrackNameStyle: CSS.Properties = {
    // backgroundColor: "green",
    float: "left",
    width: "15%",
  };

  const IsEnabledButton: CSS.Properties = {
    position: "absolute",
    marginLeft: "15%",
    marginTop: "7.5px",
    width: "20px",
    height: "20px",
    borderRadius: "25px", // turn div into a circle
    backgroundColor: "Red",
    zIndex: "1",
  };

  const handleTrackChange = () => {
    let tempObject = {
      type: "TrackChange",
      track: idx,
    };
    editAudioNodeData(tempObject, []);
  };

  let handleToggleEnabledButtonClick = () => {};

  return (
    <div style={AudioSettingsTrackStyle} onClick={handleTrackChange}>
      <p style={TrackNameStyle}>{trackName}</p>
      <div
        style={IsEnabledButton}
        onClick={handleToggleEnabledButtonClick}
      ></div>
    </div>
  );
};

export default AudioSettingsTrack;
