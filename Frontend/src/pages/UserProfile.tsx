import React from "react";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";

const UserProfile = () => {
  const authContext = useContext(AuthContext); // user and dispatch properties
  const profileContext = useContext(ProfileContext);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isInEditMode, setIsInEditMode] = useState(false);

  const [userName, setUserName] = useState("null");
  const [email, setEmail] = useState("null");
  const [soundcloudURL, setsoundcloudURL] = useState("");
  const [bandcampURL, setBandcampURL] = useState("");
  const [spotifyURL, setSpotifyURL] = useState("");
  const [youtubeURL, setYoutubeURL] = useState("");
  const [twitterURL, setTwitterURL] = useState("");
  const [facebookURL, setFacebookURL] = useState("");
  const [instagramURL, setInstagramURL] = useState("");
  const [visibility, setVisibility] = useState("N/A"); // Public (visible to all users), Private (only visible to owner), Friends (only friends can view)

  const navigate = useNavigate();

  const editsoundcloudURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    setsoundcloudURL(event.target.value);
  };

  const editBandcampURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBandcampURL(event.target.value);
  };

  const editSpotifyURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpotifyURL(event.target.value);
  };

  const editYoutubeURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeURL(event.target.value);
  };

  const editTwitterURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwitterURL(event.target.value);
  };

  const editFacebookURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFacebookURL(event.target.value);
  };

  const editInstagramURL = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInstagramURL(event.target.value);
  };

  const editVisibility = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setVisibility(event.target.value);
  };

  const deleteProfile = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete your profile and all associated data?"
    );

    if (confirmDelete) {
      // send DELETE request to delete the user's profile and all associated data

      let response = await fetch("http://localhost:8005/user/profile", {
        method: "DELETE",
        headers: {
          "Content-type": "application/json; charset=UTF-8", // content type seems to fix CORS errors...
          Authorization: `Bearer ${authContext.user.token}`,
        },
      });

      const json = await response.json();

      if (response.ok) {
        setMessage("Account and info deleted!");
        localStorage.removeItem("user");

        authContext.dispatch({ type: "LOGOUT", payload: null });

        setTimeout(() => {
          // wait 3 seconds to allow the user to see deletion success message
          navigate("/");
        }, 3000);
      } else {
        setError(json.error);
      }

      // logout and delete cookie upon acct deletion
    }
  };

  const toggleEditMode = async () => {
    setError("");
    setMessage("");

    if (isInEditMode) {
      let temp: any = {};

      if (soundcloudURL) {
        if (!soundcloudURL.includes("soundcloud.com")) {
          setError("Soundcloud link is invalid!");
          return;
        }

        temp["soundcloud"] = soundcloudURL;
      }
      if (bandcampURL) {
        if (!bandcampURL.includes("bandcamp.com")) {
          setError("Bandcamp link is invalid!");
          return;
        }

        temp["bandcamp"] = bandcampURL;
      }
      if (spotifyURL) {
        if (!spotifyURL.includes("spotify.com")) {
          setError("Spotify link is invalid!");
          return;
        }

        temp["spotify"] = spotifyURL;
      }
      if (youtubeURL) {
        if (!youtubeURL.includes("youtube.com")) {
          setError("Yutube link is invalid!");
          return;
        }

        temp["youtube"] = youtubeURL;
      }
      if (twitterURL) {
        if (!twitterURL.includes("twitter.com")) {
          setError("Twitter link is invalid!");
          return;
        }

        temp["twitter"] = twitterURL;
      }
      if (facebookURL) {
        if (!facebookURL.includes("facebook.com")) {
          setError("Facebook link is invalid!");
          return;
        }

        temp["facebook"] = facebookURL;
      }
      if (instagramURL) {
        if (!instagramURL.includes("instagram.com")) {
          setError("Instagram link is invalid!");
          return;
        }

        temp["instagram"] = instagramURL;
      }

      let updateObject = {
        profile: {
          visibility: visibility,
          hasProfileBeenSet: true,
          socialMediaHandles: temp,
        },
      };

      const response = await fetch("http://localhost:8005/user/profile", {
        method: "PATCH",
        headers: {
          "Content-type": "application/json; charset=UTF-8", // content type seems to fix CORS errors...
          Authorization: `Bearer ${authContext.user.token}`,
        },
        body: JSON.stringify(updateObject),
      });

      if (response.ok) {
        getUserProfile(); // fetch user profile again from server to update screen
        setMessage("Profile successfully updated");
      } else {
        setError("Failed to update user data!");
      }
    }
    setIsInEditMode(!isInEditMode);
  };

  const preventPageAccess = () => {
    // DO not allow a user to access the profile page if not logged in OR if profile has yet to be set
    const item = localStorage.getItem("user");

    if (!item) {
      navigate("/login");
    }
  };

  const setEmailAndUserName = async () => {
    if (!authContext.user) {
      // no user information to retrieve :/
      return;
    }

    if (authContext.user.userName) {
      setUserName(authContext.user.userName);
    }

    setEmail(authContext.user.email);
  };

  const getUserProfile = async () => {
    if (!authContext || !authContext.user || !authContext.user.token) {
      return;
    }

    const response = await fetch("http://localhost:8005/user/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${authContext.user.token}` },
    });

    const json = await response.json();

    if (!json.profile.hasProfileBeenSet) {
      setIsInEditMode(true);
    }

    profileContext.dispatch({ type: "SET", payload: json.profile }); // save profile to context
  };

  const updateProfileData = async () => {
    // sync displayed data with server data upon profileContext change

    if (!profileContext.profile) {
      return;
    }

    let temp = profileContext.profile;

    setVisibility(temp.visibility);

    if (temp.socialMediaHandles) {
      if (temp.socialMediaHandles.soundcloud) {
        setsoundcloudURL(temp.socialMediaHandles.soundcloud);
      }
      if (temp.socialMediaHandles.bandcamp) {
        setBandcampURL(temp.socialMediaHandles.bandcamp);
      }
      if (temp.socialMediaHandles.spotify) {
        setSpotifyURL(temp.socialMediaHandles.spotify);
      }
      if (temp.socialMediaHandles.youtube) {
        setYoutubeURL(temp.socialMediaHandles.youtube);
      }
      if (temp.socialMediaHandles.twitter) {
        setTwitterURL(temp.socialMediaHandles.twitter);
      }
      if (temp.socialMediaHandles.facebook) {
        setFacebookURL(temp.socialMediaHandles.facebook);
      }
      if (temp.socialMediaHandles.instagram) {
        setInstagramURL(temp.socialMediaHandles.instagram);
      }
    }
  };

  useEffect(() => {
    // Defining functions outside of useEffect hook prevented annoying bugs
    setEmailAndUserName();
  }, [authContext]); // rerun when authContext is changed

  useEffect(() => {
    preventPageAccess();
  }, []); // Check if logged in, and check if profile is set

  useEffect(() => {
    getUserProfile();
  }, [authContext]); // rerun when authContext is changed

  useEffect(() => {
    // update profle data when profile context changes
    updateProfileData();
  }, [profileContext]);

  return (
    <div className="mainArea">
      <h3>{`${userName === "null" ? email : userName}'s Profile`}</h3>
      <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"></img>{" "}
      {/* Temp Image */}
      <div className="profileData">
        <h1>Email: {email} </h1>
      </div>
      <div className="profileData">
        <h1>User Name: {userName === "null" ? "N/A" : userName} </h1>
      </div>
      <div className="profileData">
        <h1>soundcloud URL: {soundcloudURL} </h1>
        {isInEditMode && (
          <input
            className="profileEditInput"
            type="text"
            value={soundcloudURL}
            onChange={editsoundcloudURL}
          ></input>
        )}
      </div>
      <div className="profileData">
        <h1>Bandcamp URL: {bandcampURL} </h1>
        {isInEditMode && (
          <input
            className="profileEditInput"
            type="text"
            value={bandcampURL}
            onChange={editBandcampURL}
          ></input>
        )}
      </div>
      <div className="profileData">
        <h1>Spotify URL: {spotifyURL} </h1>
        {isInEditMode && (
          <input
            className="profileEditInput"
            type="text"
            value={spotifyURL}
            onChange={editSpotifyURL}
          ></input>
        )}
      </div>
      <div className="profileData">
        <h1>Youtube URL: {youtubeURL} </h1>
        {isInEditMode && (
          <input
            className="profileEditInput"
            type="text"
            value={youtubeURL}
            onChange={editYoutubeURL}
          ></input>
        )}
      </div>
      <div className="profileData">
        <h1>Twitter URL: {twitterURL} </h1>
        {isInEditMode && (
          <input
            className="profileEditInput"
            type="text"
            value={twitterURL}
            onChange={editTwitterURL}
          ></input>
        )}
      </div>
      <div className="profileData">
        <h1>Facebook URL: {facebookURL} </h1>
        {isInEditMode && (
          <input
            className="profileEditInput"
            type="text"
            value={facebookURL}
            onChange={editFacebookURL}
          ></input>
        )}
      </div>
      <div className="profileData">
        <h1>Instagram URL: {instagramURL} </h1>
        {isInEditMode && (
          <input
            className="profileEditInput"
            type="text"
            value={instagramURL}
            onChange={editInstagramURL}
          ></input>
        )}
      </div>
      <div className="profileData">
        <h1>Visibility: {visibility} </h1>
        {isInEditMode && (
          <select
            className="profileEditInput"
            value={visibility}
            onChange={editVisibility}
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="FriendsOnly">FriendsOnly</option>
          </select>
        )}
      </div>
      <div className="profileEdit">
        <button onClick={toggleEditMode}>
          {isInEditMode ? "Save profile" : "Edit Profile"}
        </button>
      </div>
      <div className="profileEdit">
        <button onClick={deleteProfile}>Delete profile</button>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default UserProfile;
