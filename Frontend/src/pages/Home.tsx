import React from "react";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { EnvironmentContext } from "../context/EnvironmentContext";

import AudioBox from "../audioComponents/AudioBox";

import { Chain, SongData } from "../customTypes";

const Home = () => {
  const [songPayload, setSongPayload] = useState<SongData[]>([]);
  const [userSongPayload, setUserSongPayload] = useState<SongData[]>([]);
  const [friendSongPayload, setFriendSongPayload] = useState<SongData[]>([]);
  const [publicSongPayload, setPublicSongPayload] = useState<SongData[]>([]);
  const [isSongPayloadSet, setIsSongPayloadSet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("My Songs");
  const [startPage, setStartPage] = useState("My Songs");
  const [songPayloadSwitchCount, setSongPayloadSwitchCount] = useState(0);
  const [isPageSwitched, setIsPageSwitched] = useState(false); // toggle this value back and forth to act as a trigger
  const authContext = useContext(AuthContext);
  const envContext = useContext(EnvironmentContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the list of songs visible to the user (and their tracks) upon page load

    if (!authContext.user || !authContext.user.token) {
      navigate("/login");
      return;
    }

    if (isSongPayloadSet) {
      return;
    }

    let getSongPayload = async () => {
      let response = await fetch(`${envContext.backendURL}/user/songs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authContext.user.token}`,
        },
      });

      setIsLoading(false);

      let json = await response.json();

      let tempUserSongsPayload = [];
      let tempFriendSongPayload = [];
      let tempPublicSongPayload = [];

      for (let i = 0; i < json.payload.length; i++) {
        if (json.payload[i].userConnection == "self") {
          tempUserSongsPayload.push(json.payload[i]);
        } else if (json.payload[i].userConnection == "friend") {
          tempFriendSongPayload.push(json.payload[i]);
        } else if (json.payload[i].userConnection == "public") {
          tempPublicSongPayload.push(json.payload[i]);
        }
      }

      setUserSongPayload(tempUserSongsPayload);
      setFriendSongPayload(tempFriendSongPayload);
      setPublicSongPayload(tempPublicSongPayload);
      setSongPayload(tempUserSongsPayload);
      setIsSongPayloadSet(true);
    };

    getSongPayload();
  }, [isSongPayloadSet, authContext]);

  useEffect(() => {
    // Add wait time when switching between pages to circumvent audiobox conflation bug

    if (!isSongPayloadSet || songPayloadSwitchCount == 0) {
      return;
    }

    setIsLoading(true);
    let tempTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [songPayload]);

  const generateAudioBoxes = (): JSX.Element => {
    let audioBoxFragment = (
      <>
        {songPayload.map((item, idx) => (
          <AudioBox
            songData={item}
            isPageSwitched={isPageSwitched}
            setIsSongPayloadSet={setIsSongPayloadSet}
            key={idx}
          ></AudioBox>
        ))}
      </>
    );

    return audioBoxFragment;
  };

  const generatePlaceholderAudioBoxes = (): JSX.Element => {
    let placeHolderArr = new Array(5).fill(0);

    let audioBoxFragment = (
      <>
        {placeHolderArr.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-300 w-12/12 lg:w-9/12 h-20 mr-auto ml-auto mt-3 pt-3 animate-pulse"
          ></div>
        ))}
      </>
    );

    return audioBoxFragment;
  };

  return (
    <div className="shadow-blue-200 bg-gradient-to-b from-prodPrimary to-prodSecondary shadow-xl w-full sm:w-8/12 h-screen mr-auto ml-auto pb-4 hide-scrollbar overflow-y-scroll">
      {/* Do not allow the displaying of audioBoxes on mobile sized screens */}

      <div className="w-10/12 h-7 ml-auto mr-auto mt-2 overflow-hidden flex justify-around">
        <div className="w-max h-max inline-block">
          {selectedPage === "My Songs" && (
            <p className="hover:font-bold border-b-2 border-black">My Songs</p>
          )}
          {selectedPage !== "My Songs" && (
            <p
              className="hover:font-bold"
              onClick={() => {
                setSelectedPage("My Songs");
                setSongPayloadSwitchCount(1);
                setIsPageSwitched(!isPageSwitched);
                setTimeout(() => {
                  setSongPayload(userSongPayload);
                }, 50);
              }}
            >
              My Songs
            </p>
          )}
        </div>
        <div className="w-max h-max inline-block">
          {selectedPage === "Friend's Songs" && (
            <p className="hover:font-bold border-b-2 border-black">
              Friend's Songs
            </p>
          )}
          {selectedPage !== "Friend's Songs" && (
            <p
              className="hover:font-bold"
              onClick={() => {
                setSelectedPage("Friend's Songs");
                setSongPayloadSwitchCount(1);
                setIsPageSwitched(!isPageSwitched);
                setTimeout(() => {
                  setSongPayload(friendSongPayload);
                }, 50);
              }}
            >
              Friend's Songs
            </p>
          )}
        </div>
        <div className="w-max h-max inline-block">
          {selectedPage === "Public songs" && (
            <p className="hover:font-bold border-b-2 border-black">
              Public songs
            </p>
          )}
          {selectedPage !== "Public songs" && (
            <p
              className="hover:font-bold"
              onClick={() => {
                setSelectedPage("Public songs");
                setSongPayloadSwitchCount(1);
                setIsPageSwitched(!isPageSwitched);
                setTimeout(() => {
                  setSongPayload(publicSongPayload);
                }, 50);
              }}
            >
              Public songs
            </p>
          )}
        </div>
      </div>

      <div className="w-full h-max mt-10 bg-prodSecondary rounded-lg z-50 fixed sm:hidden">
        <h3 className="ml-auto mr-auto p-5 font-bold text-4xl">
          We're sorry, but we cannot support mobile devices!
        </h3>
      </div>
      <div className="blur-sm sm:blur-none sm:pointer-events-auto pointer-events-none">
        {!isLoading && songPayload.length > 0 && generateAudioBoxes()}
        {!isLoading && songPayload.length == 0 && (
          <div className="w-max h-max ml-auto mr-auto mt-5 border-b-2 border-black ">
            <h3 className="">Sorry, but you have no songs to show.</h3>
          </div>
        )}
        {isLoading && generatePlaceholderAudioBoxes()}
      </div>
    </div>
  );
};

export default Home;
