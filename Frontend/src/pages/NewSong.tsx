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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
    setError("");
    setMessage("");

    if (!authContext.user || !authContext.user.token) {
      setError("Cannot upload tracks without being logged in!");
      return;
    }

    if (songUploadData.length === 0) {
      setError("No tracks to upload!");
      return;
    }

    const illegalChars = [
      "#",
      "%",
      "&",
      "{",
      "}",
      "\\",
      "<",
      ">",
      "*",
      "?",
      "/",
      "$",
      "!",
      "'",
      '"',
      ":",
      "@",
      "+",
      "`",
      "|",
      "=",
    ]; // Characters that CANNOT be used as filenames

    for (let i = 0; i < songUploadData.length; i++) {
      /*
       Do not allow the user to upload a track without a name or without a file.
       also do not allow a user to upload a track with a name that contains illegal characters
      */

      if (songUploadData[i].trackName === "" || !songUploadData[i].trackName) {
        setError("Cannot upload track without a name!");
        return;
      }

      for (let j = 0; j < songUploadData[i].trackName.length; j++) {
        if (illegalChars.includes(songUploadData[i].trackName[j])) {
          setError(
            `Track named: ${songUploadData[i].trackName} contains illegal character: ${songUploadData[i].trackName[j]}`
          );
          return;
        }
      }

      if (songUploadData[i].file === undefined) {
        setError("Cannot upload a track without a file!");
        return;
      }
    }

    /*
      Send request to initialize Song!
    */

    let response = await fetch("http://localhost:8005/upload/songInit", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8", // content type seems to fix CORS errors...
        Authorization: `Bearer ${authContext.user.token}`,
      },
    });

    // for (let i = 0; i < songUploadData.length; i++) {
    //   const formData = new FormData();
    //   formData.append("Authorization", `Bearer ${authContext.user.token}`);
    //   formData.append("trackName", songUploadData[i].trackName);
    //   formData.append("track", songUploadData[i].file!);

    //   /*
    //     Having header will create "request entity too large" error.
    //     Workaround implemented to send JWT through body's formData
    //   */
    //   let response = await fetch("http://localhost:8005/upload/track", {
    //     method: "POST",
    //     body: formData,
    //   });

    //   const json = await response.json();

    //   if (response.ok) {
    //     setMessage("Tracks uploaded successfully!");
    //   } else {
    //     setError("File uploading failed!");
    //   }
    // }
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
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default NewSong;
