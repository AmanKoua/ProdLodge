import React from "react";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const UserProfile = () => {
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext); // user and dispatch properties

  const [userName, setUserName] = useState("null");
  const [email, setEmail] = useState("null");
  const [soundCloudURL, setSoundCloudURL] = useState("");
  const [bandcampURL, setBandampURL] = useState("");
  const [spotifyURL, setSpotifyURL] = useState("");
  const [youtubeURL, setYoutubeURL] = useState("");
  const [twitterURL, setTwitterURL] = useState("");
  const [facebookURL, setFacebookURL] = useState("");
  const [instagramURL, setInstagramURL] = useState("");
  const [friendsIdList, setFriendsIdList] = useState([]);

  const navigate = useNavigate();

  const preventPageAccess = () => {
    // DO not allow a user to access the profile page if not logged in
    const item = localStorage.getItem("user");

    if (!item) {
      navigate("/login");
    }
  };

  const getProfileEmailAndUserName = async () => {
    if (!authContext.user) {
      // no user information to retrieve :/
      return;
    }

    if (authContext.user.userName) {
      setUserName(authContext.user.userName);
    }

    setEmail(authContext.user.email);
  };

  useEffect(() => {
    preventPageAccess();
    getProfileEmailAndUserName();
  }, [authContext]); // rerun when authContext is changed

  return (
    <div className="mainArea">
      <h3>{`${userName === "null" ? email : userName}'s Profile`}</h3>
      <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"></img>
      <div className="profileData">
        <h1>Email: {email} </h1>
      </div>
      <div className="profileData">
        <h1>User Name: {userName === "null" ? "N/A" : userName} </h1>
      </div>
      <div className="profileData">
        <h1>SoundCloud URL: {soundCloudURL} </h1>
      </div>
      <div className="profileData">
        <h1>Bandcamp URL: {bandcampURL} </h1>
      </div>
      <div className="profileData">
        <h1>Spotify URL: {spotifyURL} </h1>
      </div>
      <div className="profileData">
        <h1>Youtube URL: {youtubeURL} </h1>
      </div>
      <div className="profileData">
        <h1>Twitter URL: {twitterURL} </h1>
      </div>
      <div className="profileData">
        <h1>Facebook URL: {facebookURL} </h1>
      </div>
      <div className="profileData">
        <h1>Instagram URL: {instagramURL} </h1>
      </div>
      <div className="profileEdit">
        <button>Edit Profile</button>
      </div>
    </div>
  );
};

export default UserProfile;
