import React from "react";
import { useState } from "react";
import CSS from "csstype";

const SongUploadContainer = () => {
  const [trackName, setTrackName] = useState("");

  const SonguploadContainerStyle: CSS.Properties = {
    display: "flex",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "15px",
    width: "50%",
    height: "35px",
    backgroundColor: "#add0f7",
  };

  const UploadFileContainerStyle: CSS.Properties = {
    // position: "relative",
    marginLeft: "3%",
    marginTop: "0.8%",
    height: "65%",
    // backgroundColor: "red",
  };

  const AddCircleContainerStyle: CSS.Properties = {
    // position: "relative",
    marginLeft: "2.8%",
    marginTop: "0.8%",
    height: "65%",
    // backgroundColor: "red",
  };

  const TrackNameInputStyle: CSS.Properties = {
    // position: "relative",
    backgroundColor: "#edf4fc",
    marginLeft: "3%",
    width: "79%",
    height: "100%",
    border: "1px solid black",
  };

  const TrackUploadInputStyle: CSS.Properties = {
    // Invisible file upload button
    position: "absolute",
    marginTop: "-0.1%",
    backgroundColor: "red",
    opacity: "0%",
    width: "2%",
  };

  const editTrackName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackName(e.target.value);
  };

  const uploadTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileType = e.target.value.substring(
      e.target.value.length - 4,
      e.target.value.length
    );

    if (!fileType.includes(".mp3")) {
      alert(`Invalid file type : ${fileType}`);
      return;
    }

    if (e.target.files!.length === 0) {
      alert("No file selected!");
      return;
    }

    if (e.target.files![0].size > 16700000) {
      // 16700000 ~ 16Mb
      alert("File exceeds 16MB limit!");
      return;
    }

    if (!e.target.files![0].type.includes("audio")) {
      alert("Invalid file type:")!;
      return;
    }
  };

  return (
    <div style={SonguploadContainerStyle}>
      <div style={UploadFileContainerStyle}>
        <span className="material-symbols-outlined">
          <input
            type="file"
            accept=".mp3"
            style={TrackUploadInputStyle}
            onChange={uploadTrack}
          />{" "}
          {/*Invisible file upload button*/}
          file_open
        </span>
      </div>
      <input
        type="text"
        placeholder="track name"
        className="track-name-input"
        onChange={editTrackName}
        value={trackName}
        style={TrackNameInputStyle}
      ></input>
      <div style={AddCircleContainerStyle}>
        <span className="material-symbols-outlined">add_circle</span>
      </div>
    </div>
  );
};

export default SongUploadContainer;
