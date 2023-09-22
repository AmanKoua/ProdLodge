import React from "react";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import AudioBox from "../audioComponents/AudioBox";

import { Chain, SongData } from "../customTypes";

const Home = () => {
  const [userSongPayload, setUserSongPayload] = useState([]);
  const [isUserSongPayloadSet, setIsUserSongPayloadSet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

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

      setIsLoading(false);

      let json = await response.json();
      setUserSongPayload(json.payload);
      setIsUserSongPayloadSet(true);
    };

    getUserSongPayload();
  }, [isUserSongPayloadSet, authContext]);

  const generateAudioBoxes = (): JSX.Element => {
    let audioBoxFragment = (
      <>
        {userSongPayload.map((item, idx) => (
          <AudioBox
            songData={item}
            setIsUserSongPayloadSet={setIsUserSongPayloadSet}
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
          <div className="bg-gray-300 w-12/12 lg:w-9/12 h-20 mr-auto ml-auto mt-3 pt-3 animate-pulse"></div>
        ))}
      </>
    );

    return audioBoxFragment;
  };

  return (
    <div className="bg-prodPrimary w-full sm:w-8/12 h-screen mr-auto ml-auto hide-scrollbar overflow-y-scroll">
      {/* Do not allow the displaying of audioBoxes on mobile sized screens */}
      <div className=" w-full h-max mt-56 bg-prodSecondary rounded-lg z-50 fixed sm:hidden">
        <h3 className="ml-auto mr-auto p-5 font-bold text-4xl">
          We're sorry, but we cannot support mobile devices!
        </h3>
      </div>
      <div className="blur-sm sm:blur-none sm:pointer-events-auto pointer-events-none">
        {!isLoading && userSongPayload.length > 0 && generateAudioBoxes()}
        {!isLoading && userSongPayload.length == 0 && (
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
