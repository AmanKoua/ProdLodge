import React from "react";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import AudioBox from "../audioComponents/AudioBox";

const Home = () => {
  const [userSongPayload, setUserSongPayload] = useState([]);
  const [isUserSongPayloadSet, setIsUserSongPayloadSet] = useState(false);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    // Get the list of user songs (and their tracks) upon page load
    if (isUserSongPayloadSet || !authContext.user || !authContext.user.token) {
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

  const generateAudioBoxes = (): JSX.Element => {
    // TODO : Stopped here!

    let audioBoxFragment = (
      <>
        {userSongPayload.map((item, idx) => (
          <AudioBox songData={item} key={idx}></AudioBox>
        ))}
      </>
    );

    return audioBoxFragment;
  };

  return <div className="home">{generateAudioBoxes()}</div>;
};

export default Home;
