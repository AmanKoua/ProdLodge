import React from "react";
import CSS from "csstype";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import SongUploadContainer from "../components/SongUploadContainer";
import { AuthContext } from "../context/AuthContext";

const NewSong = () => {
  const [songUploadData, setSongUploadData] = useState([
    { trackName: "", file: undefined },
  ]); // [{trackName: string, file: FileList}]
  const navigate = useNavigate();
  let authContext = useContext(AuthContext);

  const SubmitButtonStyle: CSS.Properties = {
    width: "50%",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "15px",
    backgroundColor: "#edf4fc",
  };

  const preventPageAccess = () => {
    // DO not allow a user to access the profile page if not logged in OR if profile has yet to be set
    const item = localStorage.getItem("user");

    if (!item) {
      navigate("/login");
    }
  };

  useEffect(() => {
    preventPageAccess();
  }, []);

  const addTrack = () => {
    setSongUploadData([...songUploadData, { trackName: "", file: undefined }]);
  };

  const initSongAndUploadTracks = async () => {
    if (!authContext.user || !authContext.user.token) {
      alert("Cannot upload tracks without being logged in!");
      return;
    }

    if (songUploadData.length === 0) {
      alert("No tracks to upload!");
      return;
    }

    for (let i = 0; i < songUploadData.length; i++) {
      // Do not allow the user to upload a track without a name or without a file
      if (
        songUploadData[i].trackName === "" ||
        songUploadData[i].file === undefined
      ) {
        alert("Cannot upload with empty track names or with empty files!");
        return;
      }
    }

    /*
      Send request to initialize Song!
    */

    for (let i = 0; i < songUploadData.length; i++) {
      const formData = new FormData();
      formData.append("Authorization", `Bearer ${authContext.user.token}`);
      formData.append("trackName", songUploadData[i].trackName);
      formData.append("track", songUploadData[i].file!);

      /*
        Having header will create "request entity too large" error.
        Workaround implemented to send JWT through body's formData
      */
      let response = await fetch("http://localhost:8005/upload/track", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      console.log(json);
    }
  };

  const generateSongUploadContainers = (): JSX.Element => {
    let uploadContainersFragment = (
      <>
        {songUploadData.map((obj, idx) => {
          return (
            <SongUploadContainer
              idx={idx}
              songUploadData={songUploadData}
              addTrack={addTrack}
              setSongUploadData={setSongUploadData}
              key={idx}
            ></SongUploadContainer>
          );
        })}
      </>
    );

    return uploadContainersFragment;
  };

  return (
    <div className="mainArea">
      <h3>Upload a new song!</h3>
      {generateSongUploadContainers()}
      <button style={SubmitButtonStyle} onClick={initSongAndUploadTracks}>
        Upload Tracks!
      </button>
    </div>
  );
};

export default NewSong;
