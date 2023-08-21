import React from "react";
import CSS from "csstype";

interface Props {
  trackName: string;
  idx: number;
}

const AudioSettingsTrack = ({ trackName, idx }: Props) => {
  const AudioSettingsTrackStyle: CSS.Properties = {
    position: "relative",
    marginTop: "8px",
    width: "100%",
    height: "35px",
    // backgroundColor: "blanchedalmond",
  };

  return <div style={AudioSettingsTrackStyle}>{trackName}</div>;
};

export default AudioSettingsTrack;
