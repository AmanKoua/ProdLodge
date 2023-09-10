import React from "react";
import CSS from "csstype";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import SongUploadContainer from "../components/SongUploadContainer";
import { AuthContext } from "../context/AuthContext";

import { SongData } from "../customTypes";

interface Props {
  songData: SongData;
  authContext: any;
  editSong: (
    songId: string,
    title: string,
    description: string
  ) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
}

const SongEntry = ({ songData, authContext, editSong, deleteSong }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [songDescription, setSongDescription] = useState("");

  useEffect(() => {
    if (songTitle || songDescription) {
      return;
    }

    setSongTitle(`${songData.title}`);
    setSongDescription(`${songData.description}`);
  }, []);

  const SongEntryStyle: CSS.Properties = {
    position: "relative",
    display: "flex",
    width: "50%",
    height: "35px",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "15px",
    backgroundColor: "#add0f7",
    transition: "all 0.3s",
    overflow: "hidden",
  };

  SongEntryStyle.height = isExpanded ? "140px" : "35px";

  const SongTitleContainerStyle: CSS.Properties = {
    position: "relative",
    width: "75%",
    height: "35px",
    marginLeft: "0px",
    marginTop: "0px",
    border: "1px solid black",
    // backgroundColor: "red",
    overflow: "hidden",
  };

  const SongOptionsContainerStyle: CSS.Properties = {
    position: "relative",
    display: "flex",
    justifyContent: "space-around",
    width: "25%",
    height: "35px",
    marginLeft: "0px",
    marginTop: "0px",
    border: "1px solid black",
    // backgroundColor: "red",
    overflow: "hidden",
  };

  const SongSettingsContainerStyle: CSS.Properties = {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "165px",
    marginLeft: "0px",
    marginTop: "35px",
    // border: "1px solid black",
    // backgroundColor: "red",
    overflow: "hidden",
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSongTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSongDescription(e.target.value);
  };

  return (
    <div style={SongEntryStyle}>
      <div style={SongTitleContainerStyle}>
        <p
          style={{
            position: "absolute",
            marginTop: "5px",
            marginLeft: "10px",
          }}
        >
          {songData.title}
        </p>
      </div>
      <div style={SongOptionsContainerStyle}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "2.3em" /*backgroundColor: "red"*/ }}
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? "arrow_drop_up" : "arrow_drop_down"}
        </span>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "2.2em" /*backgroundColor: "orange"*/ }}
          onClick={async () => {
            const confirmed = confirm(
              'Are you sure you want to delete "' + songData.title + '" ?'
            );

            if (confirmed) {
              await deleteSong(songData.id);
            } else {
              return;
            }
          }}
        >
          delete
        </span>
      </div>
      <div style={SongSettingsContainerStyle}>
        <input
          type="text"
          value={songTitle}
          style={{
            width: "100%",
            height: "35px",
            display: "block",
            border: "1px solid black",
          }}
          onChange={handleTitleChange}
        />
        <input
          type="text"
          value={songDescription}
          style={{ width: "100%", height: "35px", border: "1px solid black" }}
          onChange={handleDescriptionChange}
        />
        <div
          style={{
            width: "100%",
            height: "35px",
            border: "1px solid black",
            // backgroundColor: "red",
            textAlign: "center",
          }}
        >
          <p
            style={{ marginTop: "5px" }}
            onClick={async () => {
              await editSong(songData.id, songTitle, songDescription);
            }}
          >
            Edit song data
          </p>
        </div>
      </div>
    </div>
  );
};

const EditSong = () => {
  const [userSongPayload, setUserSongPayload] = useState([]);
  const [isUserSongPayloadSet, setIsUserSongPayloadSet] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  let authContext = useContext(AuthContext);

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
    // Get the list of user songs (and their tracks) upon page load

    if (!authContext.user || !authContext.user.token) {
      navigate("/login");
      return;
    }

    if (isUserSongPayloadSet) {
      return;
    }

    let getUserSongPayload = async () => {
      let response = await fetch("http://localhost:8005/user/songs", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authContext.user.token}`,
        },
      });

      let json = await response.json();
      setUserSongPayload(json.payload);
      setIsUserSongPayloadSet(true);
    };

    getUserSongPayload();
  }, [isUserSongPayloadSet, authContext]);

  const editSong = async (
    songId: string,
    title: string,
    description: string
  ) => {
    const response = await fetch("http://localhost:8005/user/song", {
      method: "PATCH",
      headers: {
        "Content-type": "Application/json",
        Authorization: `Bearer ${authContext.user.token}`,
      },
      body: JSON.stringify({
        songId: songId,
        title: title,
        description: description,
      }),
    });

    if (response.ok) {
      setMessage("Song edited successfully!");
    } else {
      setError("Error updating song!");
    }

    return;
  };

  const deleteSong = async (songId: string) => {
    const response = await fetch("http://localhost:8005/user/song", {
      method: "DELETE",
      headers: {
        "Content-type": "Application/json",
        Authorization: `Bearer ${authContext.user.token}`,
      },
      body: JSON.stringify({
        songId: songId,
      }),
    });

    if (response.ok) {
      setMessage("Song deleted successfully!");
    } else {
      setError("Error deleting song!");
    }

    return;
  };

  const SongNameInputStyle: CSS.Properties = {
    // position: "relative",
    backgroundColor: "#edf4fc",
    marginLeft: "auto",
    marginRight: "auto",
    width: "50%",
    height: "35px",
    border: "1px solid black",
  };

  const SongDescInputStyle: CSS.Properties = {
    // position: "relative",
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

  const generateSongEntries = (): JSX.Element => {
    return (
      <>
        {userSongPayload.map((item, idx) => {
          return (
            <SongEntry
              songData={item}
              authContext={authContext}
              key={idx}
              editSong={editSong}
              deleteSong={deleteSong}
            ></SongEntry>
          );
        })}
      </>
    );
  };

  return (
    <div className="bg-prodPrimary overflow-hidden w-full h-screen sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
      <h3 className="w-max mr-auto ml-auto p-2 font-bold">
        Edit an existing song
      </h3>
      {generateSongEntries()}
      {error && <div className="error mt-2">{error}</div>}
      {message && <div className="message mt-2">{message}</div>}
    </div>
  );
};

export default EditSong;
