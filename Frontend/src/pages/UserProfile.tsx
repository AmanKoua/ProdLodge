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

  const [profileImage, setProfileImage] = useState<any>();
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

  const uploadProfileImg = async () => {
    const permittedFileTypes = [".jpg", ".png"];

    if (!profileImage) {
      alert("No file selected!");
      return;
    }

    const fileType = profileImage.name.substring(
      profileImage.name.length - 4,
      profileImage.name.length
    );

    if (!permittedFileTypes.includes(fileType)) {
      alert(`Invalid file type : ${fileType}`);
      return;
    }

    if (profileImage.size > 1000000) {
      // 1000000 ~ 1Mb
      alert("File exceeds 1MB limit!");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", profileImage);

    let response = await fetch("http://localhost:8005/upload/profileImage", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${authContext.user.token}`,
      },
    });

    if (response.ok) {
      const json = await response.json();
      console.log(json);
    } else {
      console.log("Response not ok!");
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

      await uploadProfileImg();

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
    <div className="bg-prodPrimary overflow-hidden w-full sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
      <h3 className="w-max ml-auto mr-auto p-2 text-4xl font-bold">{`${
        userName === "null" ? email : userName
      }'s Profile`}</h3>
      <div className="w-3/12 h-max ml-auto mr-auto overflow-hidden">
        {/* Temp Image */}
        <img
          className="w-64 ml-auto mr-auto object-cover"
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        ></img>

        {isInEditMode && (
          <>
            <div className="w-max ml-auto mr-auto mt-3">
              <span
                className="material-symbols-outlined ml-auto mr-auto"
                onClick={() => {
                  let temp = document.getElementById("hiddenImageUpload");
                  temp?.click();
                }}
              >
                file_open
              </span>
            </div>
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              id="hiddenImageUpload"
              onChange={(e) => {
                setProfileImage(e.target.files![0]);
              }}
            />
          </>
        )}
      </div>
      <div className="overflow-hidden w-max ml-auto mr-auto mt-3 mb-3 border-prodSecondary border-t-2 border-b-2">
        <div className="w-max mr-auto">
          <h1 className="text-xl">Email: {email} </h1>
        </div>
        <div className="w-max  mr-auto ">
          <h1 className="text-xl">
            User Name: {userName === "null" ? "N/A" : userName}{" "}
          </h1>
        </div>
        <div className="w-max  mr-auto ">
          <h1 className="text-xl">
            soundcloud URL: {!isInEditMode && soundcloudURL}
            {isInEditMode && (
              <input
                className="p-1"
                type="text"
                value={soundcloudURL}
                onChange={editsoundcloudURL}
              ></input>
            )}
          </h1>
        </div>
        <div className="w-max  mr-auto ">
          <h1 className="text-xl">
            Bandcamp URL: {!isInEditMode && bandcampURL}{" "}
            {isInEditMode && (
              <input
                className="p-1"
                type="text"
                value={bandcampURL}
                onChange={editBandcampURL}
              ></input>
            )}
          </h1>
        </div>
        <div className="w-max  mr-auto ">
          <h1 className="text-xl">
            Spotify URL: {!isInEditMode && spotifyURL}{" "}
            {isInEditMode && (
              <input
                className="p-1"
                type="text"
                value={spotifyURL}
                onChange={editSpotifyURL}
              ></input>
            )}
          </h1>
        </div>
        <div className="w-max  mr-auto ">
          <h1 className="text-xl">
            Youtube URL: {!isInEditMode && youtubeURL}{" "}
            {isInEditMode && (
              <input
                className="p-1"
                type="text"
                value={youtubeURL}
                onChange={editYoutubeURL}
              ></input>
            )}
          </h1>
        </div>
        <div className="w-max  mr-auto ">
          <h1 className="text-xl">
            Twitter URL: {!isInEditMode && twitterURL}{" "}
            {isInEditMode && (
              <input
                className="p-1"
                type="text"
                value={twitterURL}
                onChange={editTwitterURL}
              ></input>
            )}
          </h1>
        </div>
        <div className="w-max  mr-auto ">
          <h1 className="text-xl">
            Facebook URL: {!isInEditMode && facebookURL}{" "}
            {isInEditMode && (
              <input
                className="p-1"
                type="text"
                value={facebookURL}
                onChange={editFacebookURL}
              ></input>
            )}
          </h1>
        </div>
        <div className="w-max  mr-auto ">
          <h1 className="text-xl">
            Instagram URL: {!isInEditMode && instagramURL}{" "}
            {isInEditMode && (
              <input
                className="p-1"
                type="text"
                value={instagramURL}
                onChange={editInstagramURL}
              ></input>
            )}
          </h1>
        </div>
        <div className="w-max  mr-auto ">
          <h1 className="text-xl">
            Visibility: {!isInEditMode && visibility}{" "}
            {isInEditMode && (
              <select
                className="p-1"
                value={visibility}
                onChange={editVisibility}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="FriendsOnly">FriendsOnly</option>
              </select>
            )}
          </h1>
        </div>
      </div>
      <div className="w-max ml-auto mr-auto ">
        <button onClick={toggleEditMode} className="btn mb-1">
          {isInEditMode ? "Save profile" : "Edit Profile"}
        </button>
      </div>
      <div className="w-max ml-auto mr-auto ">
        <button onClick={deleteProfile} className="btn mb-3">
          Delete profile
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default UserProfile;
