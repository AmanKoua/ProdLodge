import React from "react";
import CSS from "csstype";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import SongUploadContainer from "../components/SongUploadContainer";
import { AuthContext } from "../context/AuthContext";
import { EnvironmentContext } from "../context/EnvironmentContext";

import { SongUploadData } from "../customTypes";

const NewSong = () => {
  const [songUploadData, setSongUploadData] = useState([
    { trackName: "", file: undefined },
  ]); // [{trackName: string, file: FileList}]
  const [songName, setSongName] = useState("");
  const [songDescription, setSongDescription] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  let authContext = useContext(AuthContext);
  let envContext = useContext(EnvironmentContext);

  const SongNameInputStyle: CSS.Properties = {
    // position: "relative",
    display: "block",
    padding: "10px",
    backgroundColor: "#edf4fc",
    marginLeft: "auto",
    marginRight: "auto",
    width: "50%",
    height: "35px",
    border: "1px solid black",
  };

  const SongDescInputStyle: CSS.Properties = {
    // position: "relative",
    display: "block",
    padding: "10px",
    backgroundColor: "#edf4fc",
    marginTop: "15px",
    marginLeft: "auto",
    marginRight: "auto",
    width: "50%",
    height: "35px",
    border: "1px solid black",
  };

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

  const addTrack = () => {
    setSongUploadData([...songUploadData, { trackName: "", file: undefined }]);
  };

  const initSongAndUploadTracks = async () => {
    setError("");
    setMessage("");

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

    if (!authContext.user || !authContext.user.token) {
      setError("Cannot upload tracks without being logged in!");
      return;
    }

    if (!songName || songName === "") {
      setError("Cannot upload song without a song name!");
      return;
    }

    if (songName.length > 70) {
      setError(
        "Cannot have a song name with more than 70 characters! Current : " +
          songName.length
      );
      return;
    }

    if (songDescription.length > 170) {
      setError(
        "Cannot have a song description with more than 170 characters! Current : " +
          songDescription.length
      );
      return;
    }

    if (!songDescription || songDescription === "") {
      setSongDescription(""); // ensure songDescription is empty
    }

    if (songUploadData.length === 0) {
      setError("No tracks to upload!");
      return;
    }

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

    let songToken = undefined;
    const payload = { name: songName, description: songDescription };

    let response = await fetch(`${envContext.backendURL}/upload/songInit`, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${authContext.user.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      let json = await response.json();
      songToken = json.token;
      setMessage("Song successfully initialized");
    } else {
      setError("Song initialization failed!");
      return;
    }

    for (let i = 0; i < songUploadData.length; i++) {
      // upload individual tracks to server
      const formData = new FormData();
      formData.append("trackName", songUploadData[i].trackName);
      formData.append("track", songUploadData[i].file!);

      /*
        Having header will create "request entity too large" error.
        Workaround implemented to send JWT through body's formData
      */
      let response = await fetch(`${envContext.backendURL}/upload/track`, {
        method: "POST",
        body: formData,
        headers: {
          songToken: `${songToken}`,
        },
      });

      if (response.ok) {
        setMessage(
          `Tracks uploaded successfully! ${i + 1}/${songUploadData.length}`
        );
      } else {
        setError("File uploading failed!");
      }
    }
  };

  const editSongName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSongName(e.target.value);
  };

  const editSongDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSongDescription(e.target.value);
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
    <div className="bg-prodPrimary overflow-hidden w-full h-screen sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
      <h3 className="w-max mr-auto ml-auto p-2 font-bold">
        Upload a new song!
      </h3>
      <input
        type="text"
        placeholder="Song Name"
        onChange={editSongName}
        value={songName}
        style={SongNameInputStyle}
      />
      <input
        type="text"
        placeholder="Song description"
        onChange={editSongDescription}
        value={songDescription}
        style={SongDescInputStyle}
      />
      {generateSongUploadContainers()}
      <div className="ml-auto mr-auto mt-3 w-max">
        <button className="btn" onClick={initSongAndUploadTracks}>
          Upload Tracks!
        </button>
      </div>
      {error && <div className="error mt-2">{error}</div>}
      {message && <div className="message mt-2">{message}</div>}
    </div>
  );
};

export default NewSong;
