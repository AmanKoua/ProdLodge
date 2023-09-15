import React from "react";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";

interface ProfilePageProps {
  userName: string;
  email: string;
  isInEditMode: boolean;

  setProfileImage: (val: any) => void;
  soundcloudURL: string;
  editsoundcloudURL: (event: React.ChangeEvent<HTMLInputElement>) => void;
  bandcampURL: string;
  editBandcampURL: (event: React.ChangeEvent<HTMLInputElement>) => void;
  spotifyURL: string;
  editSpotifyURL: (event: React.ChangeEvent<HTMLInputElement>) => void;
  youtubeURL: string;
  editYoutubeURL: (event: React.ChangeEvent<HTMLInputElement>) => void;
  twitterURL: string;
  editTwitterURL: (event: React.ChangeEvent<HTMLInputElement>) => void;
  facebookURL: string;
  editFacebookURL: (event: React.ChangeEvent<HTMLInputElement>) => void;
  instagramURL: string;
  editInstagramURL: (event: React.ChangeEvent<HTMLInputElement>) => void;
  visibility: string;
  editVisibility: (event: React.ChangeEvent<HTMLSelectElement>) => void;

  toggleEditMode: () => Promise<void>;
  deleteProfile: () => Promise<void>;

  error: string;
  message: string;
}

const ProfilePage = ({
  userName,
  email,
  isInEditMode,

  setProfileImage,
  soundcloudURL,
  editsoundcloudURL,
  bandcampURL,
  editBandcampURL,
  spotifyURL,
  editSpotifyURL,
  youtubeURL,
  editYoutubeURL,
  twitterURL,
  editTwitterURL,
  facebookURL,
  editFacebookURL,
  instagramURL,
  editInstagramURL,
  visibility,
  editVisibility,

  toggleEditMode,
  deleteProfile,

  error,
  message,
}: ProfilePageProps) => {
  return (
    <div className="w-6/12 ml-auto mr-auto">
      <h3 className="w-max ml-auto mr-auto p-2 text-4xl font-bold">{`${
        userName === "null" ? email : userName
      }'s Profile`}</h3>
      <div className="w-3/12 h-max ml-auto mr-auto overflow-hidden">
        {/* Temp Image */}
        <img
          className="w-64 ml-auto mr-auto rounded-3xl object-cover"
          src=""
          id="profileImage"
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
      <div className="w-10/12 ml-auto mr-auto mb-3 flex justify-around">
        <button onClick={toggleEditMode} className="btn">
          {isInEditMode ? "Save profile" : "Edit Profile"}
        </button>
        <button onClick={deleteProfile} className="btn">
          Delete profile
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
    </div>
  );
};

const UserProfile = () => {
  const authContext = useContext(AuthContext); // user and dispatch properties
  const profileContext = useContext(ProfileContext);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [triggerProfileFetch, setTriggerProfileFetch] = useState(true);
  const [selectedPage, setSelectedPage] = useState("profile");

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
    }
  };

  const uploadProfileImg = () => {
    return new Promise(async (res, rej) => {
      const permittedFileTypes = [".jpg", ".png"];

      if (!profileImage) {
        res(false);
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
        console.log("image uplading successful!");
        res(true);
      } else {
        console.log("Image uploading failed");
        rej();
      }
    });
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

      const wasImageUploaded = await uploadProfileImg();
      const timeout = wasImageUploaded ? 1500 : 0; // determine timeout based on whether or not image was uploaded

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
        // getUserProfile(); // fetch user profile again from server to update screen

        setTimeout(() => {
          // Wait if profile image was just updated
          setTriggerProfileFetch(true);
        }, timeout);

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

    if (json.profile.doesUserHaveProfileImage) {
      await getUserProfileImage();
    } else {
      document.getElementById("profileImage").src =
        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    }

    profileContext.dispatch({ type: "SET", payload: json.profile }); // save profile to context
  };

  const getUserProfileImage = async () => {
    const response = await fetch("http://localhost:8005/user/profileImage", {
      method: "GET",
      headers: { Authorization: `Bearer ${authContext.user.token}` },
    });

    if (!response.ok) {
      console.log("Failed fetching profile image!");
      return;
    }

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    document.getElementById("profileImage").src = objectURL;
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
    if (triggerProfileFetch) {
      // mechanism to ensure that profile is only fetched once!
      console.log("Fetching user profile!");
      getUserProfile();
      setTriggerProfileFetch(false);
    } else {
      return;
    }
  }, [authContext, triggerProfileFetch]); // rerun when authContext is changed

  useEffect(() => {
    // update profle data when profile context changes
    updateProfileData();
  }, [profileContext]);

  return (
    <div className="bg-prodPrimary overflow-hidden w-full sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
      <div className="w-6/12 h-7 ml-auto mr-auto overflow-hidden flex justify-around">
        <div className="w-max h-max inline-block">
          {selectedPage === "profile" && (
            <p className="hover:font-bold border-b-2 border-black">Profile</p>
          )}
          {selectedPage !== "profile" && (
            <p
              className="hover:font-bold"
              onClick={() => {
                setSelectedPage("profile");
              }}
            >
              Profile
            </p>
          )}
        </div>
        <div className="w-max h-max inline-block">
          {selectedPage === "friends" && (
            <p className="hover:font-bold border-b-2 border-black">Friends</p>
          )}
          {selectedPage !== "friends" && (
            <p
              className="hover:font-bold"
              onClick={() => {
                setSelectedPage("friends");
              }}
            >
              Friends
            </p>
          )}
        </div>
      </div>
      <ProfilePage
        userName={userName}
        email={email}
        isInEditMode={isInEditMode}
        setProfileImage={setProfileImage}
        soundcloudURL={soundcloudURL}
        editsoundcloudURL={editsoundcloudURL}
        bandcampURL={bandcampURL}
        editBandcampURL={editBandcampURL}
        spotifyURL={spotifyURL}
        editSpotifyURL={editSpotifyURL}
        youtubeURL={youtubeURL}
        editYoutubeURL={editYoutubeURL}
        twitterURL={twitterURL}
        editTwitterURL={editTwitterURL}
        facebookURL={facebookURL}
        editFacebookURL={editFacebookURL}
        instagramURL={instagramURL}
        editInstagramURL={editInstagramURL}
        visibility={visibility}
        editVisibility={editVisibility}
        toggleEditMode={toggleEditMode}
        deleteProfile={deleteProfile}
        error={error}
        message={message}
      ></ProfilePage>
    </div>
  );
};

export default UserProfile;
