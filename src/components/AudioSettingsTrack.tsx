import React from "react";
import CSS from "csstype";

interface Props {
  trackName: string;
  idx: number;
  editAudioNodeData: (data: Object, position: number[]) => void;
}

const AudioSettingsTrack = ({ trackName, idx, editAudioNodeData }: Props) => {
  const AudioSettingsTrackStyle: CSS.Properties = {
    position: "relative",
    marginTop: "8px",
    width: "100%",
    height: "35px",
    // backgroundColor: "blanchedalmond",
  };

  const handleTrackChange = () => {
    let tempObject = {
      type: "TrackChange",
      track: idx,
    };
    editAudioNodeData(tempObject, []);
  };

  return (
    <div style={AudioSettingsTrackStyle} onClick={handleTrackChange}>
      {trackName}
    </div>
  );
};

export default AudioSettingsTrack;
