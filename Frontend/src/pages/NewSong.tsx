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
    /*
      TODO : Remove return after testing is completed!
    */

    return;

    preventPageAccess();
  }, []);

  const addTrack = () => {
    setSongUploadData([...songUploadData, { trackName: "", file: undefined }]);
  };

  const initSongAndUploadTracks = async () => {
    if (songUploadData.length === 0) {
      return;
    }

    for (let i = 0; i < songUploadData.length; i++) {
      // TODO : Finished here!

      if (songUploadData[i].file === undefined) {
        continue;
      }

      const formData = new FormData();

      formData.append("track", songUploadData[i].file!);

      let response = await fetch("http://localhost:8005/upload/track", {
        method: "POST",
        /*
        Having header will create "request entity too large error!?"
        Headers are the main culprit.
        */
        // headers: {
        //   "Content-type": "application/json; charset=UTF-8", // content type seems to fix CORS errors...
        //   Authorization: `Bearer ${authContext.user.token}`,
        // },
        body: formData,
      });
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
