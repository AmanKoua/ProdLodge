import React, { LegacyRef, MutableRefObject } from "react";
import CSS from "csstype";
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

import SongUploadContainer from "../components/SongUploadContainer";
import { AuthContext } from "../context/AuthContext";
import { EnvironmentContext } from "../context/EnvironmentContext";

import { SongData } from "../customTypes";

interface Props {
  songData: SongData;
  authContext: any;
  editSong: (
    songId: string,
    title: string,
    description: string,
    visibility: string
  ) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
}

const SongEntry = ({ songData, authContext, editSong, deleteSong }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [songDescription, setSongDescription] = useState("");
  const [songVisibility, setSongVisibility] = useState("");
  // const [restrictedAccessList, setRestrictedAccessList] = useState([]);

  useEffect(() => {
    if (songTitle || songDescription || songVisibility) {
      return;
    }

    setSongTitle(`${songData.title}`);
    setSongDescription(`${songData.description}`);
    setSongVisibility(`${songData.visibility}`);
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

  SongEntryStyle.height = isExpanded
    ? songVisibility === "restricted"
      ? "270px"
      : "281px" // This changes overall box height (yes 10ths of a pixel are allowed....)
    : "35px";

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
    height: "350px",
    marginLeft: "0px",
    marginTop: "35px",
    border: "1px solid black",
    // backgroundColor: "green",
    overflow: "hidden",
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSongTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSongDescription(e.target.value);
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSongVisibility(e.target.value);
  };

  return (
    <div style={SongEntryStyle} className="hide-scrollbar">
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
        <p
          className="bg-prodPrimary font-bold"
          style={{
            width: "100%",
            height: "35px",
            marginBottom: "0px",
            border: "1px solid black",
            padding: "3px",
          }}
        >
          Title
        </p>
        <input
          type="text"
          value={songTitle}
          style={{
            width: "100%",
            height: "35px",
            display: "block",
            border: "1px solid black",
            padding: "3px",
          }}
          onChange={handleTitleChange}
        />
        <p
          className="bg-prodPrimary font-bold"
          style={{
            width: "100%",
            height: "35px",
            marginBottom: "0px",
            border: "1px solid black",
            padding: "3px",
          }}
        >
          Description
        </p>
        <input
          type="text"
          value={songDescription}
          style={{
            width: "100%",
            height: "35px",
            border: "1px solid black",
            padding: "3px",
          }}
          onChange={handleDescriptionChange}
        />
        <p
          className="bg-prodPrimary font-bold"
          style={{
            width: "100%",
            height: "35px",
            marginBottom: "0px",
            border: "1px solid black",
            padding: "3px",
          }}
        >
          Visibility
        </p>
        <select
          style={{
            width: "100%",
            height: "35px",
            border: "1px solid black",
            padding: "3px",
          }}
          onChange={handleVisibilityChange}
          value={songVisibility}
        >
          <option value="public">public</option>
          <option value="private">private</option>
          <option value="friendsonly">friends only</option>
          {/* <option value="restricted">restricted</option> */}
        </select>
        {/* {songVisibility === "restricted" && (
          <div
            style={{
              width: "100%",
              height: "94px",
              marginBottom: "0px",
              backgroundColor: "white",
            }}
          ></div>
        )} */}
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
              await editSong(
                songData.id,
                songTitle,
                songDescription,
                songVisibility
              );
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
  const [pageHeight, setPageHeight] = useState<number | undefined>(undefined);
  const [pageClassName, setPageClassName] = useState(
    "bg-prodPrimary w-full h-screen sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center hide-scrollbar"
  );
  const editSongPage = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  let authContext = useContext(AuthContext);
  let envContext = useContext(EnvironmentContext);

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

    setUserSongPayload([]);

    let getUserSongPayload = async () => {
      console.log("requesting edit!");
      let response = await fetch(`${envContext.backendURL}/user/songs`, {
        method: "GET",
        headers: {
          isEdit: `true`,
          Authorization: `Bearer ${authContext.user.token}`,
        },
      });

      let json = await response.json();
      console.log(json.payload);
      setUserSongPayload(json.payload);
      setIsUserSongPayloadSet(true);
    };

    getUserSongPayload();
  }, [isUserSongPayloadSet, authContext]);

  useEffect(() => {
    let temp = editSongPage.current as unknown as HTMLDivElement;
    setPageHeight(temp!.clientHeight);
  }, []);

  useEffect(() => {
    /*  
      Workaround for dynamic page stretching when expanded songs are larger than the screen side
    */

    let setHeightInterval = setInterval(() => {
      if (editSongPage && editSongPage.current && pageHeight) {
        let temp = editSongPage.current as unknown as HTMLDivElement;

        let expandedName =
          "bg-prodPrimary w-full h-max sm:w-8/12 ml-auto mr-auto pb-3 flex-col jusitfy-items-center hide-scrollbar";
        let shrunkName =
          "bg-prodPrimary w-full h-screen sm:w-8/12 ml-auto mr-auto pb-3 flex-col jusitfy-items-center hide-scrollbar";

        if (
          temp!.scrollHeight > temp!.clientHeight &&
          pageClassName != expandedName
        ) {
          setTimeout(() => {
            setPageClassName(expandedName);
          }, 50);
        } else if (
          temp!.clientHeight < pageHeight &&
          pageClassName != shrunkName
        ) {
          setTimeout(() => {
            setPageClassName(shrunkName);
          }, 50);
        }
      } else {
        console.log(editSongPage.current, pageHeight);
      }
    }, 100);

    return () => {
      clearInterval(setHeightInterval);
    };
  }, [editSongPage, pageHeight]);

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

  // useEffect(() => {
  //   console.log(userSongPayload);
  // }, [userSongPayload]);

  const editSong = async (
    songId: string,
    title: string,
    description: string,
    visibility: string
  ) => {
    const response = await fetch(`${envContext.backendURL}/user/song`, {
      method: "PATCH",
      headers: {
        "Content-type": "Application/json",
        Authorization: `Bearer ${authContext.user.token}`,
      },
      body: JSON.stringify({
        songId: songId,
        title: title,
        description: description,
        visibility: visibility,
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
    const response = await fetch(`${envContext.backendURL}/user/song`, {
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

  const generatePlaceholderSongEntries = (): JSX.Element => {
    const tempSongPayloadArr = new Array(5).fill(0);

    return (
      <div>
        {tempSongPayloadArr.map((item, idx) => {
          return (
            <div
              className="bg-gray-200 w-6/12 h-10 mt-3 ml-auto mr-auto animate-pulse"
              key={idx}
            ></div>
          );
        })}
      </div>
    );
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
    <>
      <div className={pageClassName} id="editSongPage" ref={editSongPage}>
        <h3 className="w-max mr-auto ml-auto p-2 font-bold">
          Edit an existing song
        </h3>
        {isUserSongPayloadSet &&
          userSongPayload.length > 0 &&
          generateSongEntries()}
        {isUserSongPayloadSet && userSongPayload.length == 0 && (
          <div className="w-max h-max ml-auto mr-auto mt-5 border-b-2 border-black ">
            <h3 className="">Sorry, but you have no songs to show.</h3>
          </div>
        )}
        {!isUserSongPayloadSet && generatePlaceholderSongEntries()}
        {error && <div className="error mt-2">{error}</div>}
        {message && <div className="message mt-2">{message}</div>}
      </div>
    </>
  );
};

export default EditSong;
