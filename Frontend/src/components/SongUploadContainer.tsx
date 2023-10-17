import React from "react";
import { useState, useEffect } from "react";
import CSS from "csstype";

import { SongUploadData } from "../customTypes";

interface Props {
  idx: number;
  songUploadData: SongUploadData[];
  addTrack: () => void;
  setSongUploadData: (val: any) => void;
}

const SongUploadContainer = ({
  idx,
  songUploadData,
  addTrack,
  setSongUploadData, // song upload data will be modified by reference
}: Props) => {
  const [trackName, setTrackName] = useState("");

  const SonguploadContainerStyle: CSS.Properties = {
    display: "flex",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "15px",
    width: "50%",
    height: "35px",
    border: "1px solid black",
    // backgroundColor: "#add0f7",
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
    marginLeft: "1%",
    marginTop: "0.8%",
    height: "65%",
    // backgroundColor: "red",
  };

  const DeleteIconContainerStyle: CSS.Properties = {
    // position: "relative",
    marginLeft: "1%",
    marginRight: "1%",
    marginTop: "0.8%",
    height: "65%",
    // backgroundColor: "red",
  };

  const TrackNameInputStyle: CSS.Properties = {
    // position: "relative",
    padding: "10px",
    backgroundColor: "transparent",
    marginLeft: "3%",
    width: "79%",
    height: "100%",
    // border: "1px solid black",
  };

  const TrackUploadInputStyle: CSS.Properties = {
    // Invisible file upload button
    position: "absolute",
    marginTop: "-0.1%",
    backgroundColor: "red",
    opacity: "0%",
    width: "2%",
  };

  useEffect(() => {
    // Update track name in input field when page is loaded (add or delete a track)
    setTrackName(songUploadData[idx].trackName);
  }, [songUploadData]);

  const deleteTrack = () => {
    if (songUploadData.length === 1) {
      return;
    }

    const temp = [...songUploadData];
    temp.splice(idx, 1);

    setSongUploadData(temp);
  };

  const editTrackName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackName(e.target.value);
    songUploadData[idx].trackName = e.target.value;
    // setSongUploadData(songUploadData);
  };

  const uploadTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileType = e.target.value.substring(
      e.target.value.length - 4,
      e.target.value.length
    );

    if (e.target.files!.length === 0) {
      alert("No file selected!");
      return;
    }

    if (!fileType.includes(".mp3")) {
      alert(`Invalid file type : ${fileType}`);
      return;
    }

    if (e.target.files![0].size > 16700000) {
      // 16700000 ~ 16Mb
      alert("File exceeds 16MB limit!");
      return;
    }

    if (!e.target.files![0].type.includes("audio")) {
      alert("Invalid file type");
      return;
    }

    songUploadData[idx].file = e.target.files![0];
  };

  return (
    <div style={SonguploadContainerStyle} className="shadow-sm">
      <div style={UploadFileContainerStyle}>
        <span className="material-symbols-outlined">
          <input
            type="file"
            accept=".mp3"
            style={TrackUploadInputStyle}
            onChange={uploadTrack}
          />
          {/*Invisible file upload button*/}
          file_open
        </span>
      </div>
      <input
        type="text"
        placeholder="track name"
        onChange={editTrackName}
        value={trackName}
        style={TrackNameInputStyle}
        className="track-name-input border-black border-l border-r"
      ></input>
      <div style={AddCircleContainerStyle} onClick={addTrack}>
        <span className="material-symbols-outlined">add_circle</span>
      </div>
      <div style={DeleteIconContainerStyle} onClick={deleteTrack}>
        <span className="material-symbols-outlined">delete</span>
      </div>
    </div>
  );
};

export default SongUploadContainer;
