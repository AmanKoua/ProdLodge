import React from "react";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";

import FriendsPage from "../components/FriendsPage";
import ProfilePage from "../components/ProfilePage";

const UserProfile = () => {
  const authContext = useContext(AuthContext); // user and dispatch properties
  const profileContext = useContext(ProfileContext);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [triggerProfileFetch, setTriggerProfileFetch] = useState(true);
  const [triggerFriendDataFetch, setTriggerFriendDataFetch] = useState(true);
  const [profileImageObjURL, setProfileImageObjURL] = useState("");
  const [selectedPage, setSelectedPage] = useState("profile");

  const [profileImage, setProfileImage] = useState<any>();
  const [friendRequests, setFriendRequests] = useState<Object[]>([]);
  const [userFriends, setUserFriends] = useState<Object[]>([]);
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

  const [addFriendEmail, setAddFriendEmail] = useState("");

  const navigate = useNavigate();

  const tryLoginFromToken = () => {
    const user = localStorage.getItem("user");
    if (user) {
      authContext.dispatch({ type: "LOGIN", payload: JSON.parse(user) }); // save returned object to global state
      return true;
    } else {
      return false;
    }
  };

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
      // document.getElementById("profileImage").src =
      //   "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
      const temp = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; // Temporary icon.
      setProfileImageObjURL(temp);
    }

    setIsImageLoading(false);

    profileContext.dispatch({ type: "SET", payload: json.profile }); // save profile to context
  };

  const getUserFriends = async () => {
    const response = await fetch("http://localhost:8005/user/friends", {
      method: "GET",
      headers: { Authorization: `Bearer ${authContext.user.token}` },
    });

    if (response.ok) {
      const payload = await response.json();
      setUserFriends(payload.friends);
    }
  };

  const getUserFriendRequests = async () => {
    if (!authContext || !authContext.user || !authContext.user.token) {
      console.log("Cannot fetch friends without a token!");
      return;
    }

    const response = await fetch("http://localhost:8005/user/friendRequests", {
      method: "GET",
      headers: { Authorization: `Bearer ${authContext.user.token}` },
    });

    if (response.ok) {
      const payload = await response.json();
      setFriendRequests(payload);
    }
  };

  const removeRequestNotification = async (id: string) => {
    let response = await fetch(
      "http://localhost:8005/user/requestNotification",
      {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${authContext.user.token}`,
        },
        body: JSON.stringify({ id: id }),
      }
    );

    if (response.ok) {
      setTimeout(() => {
        setTriggerFriendDataFetch(true);
      }, 1500);
    } else {
      setError("Request notification removal failed!");
    }
  };

  const addFriend = async () => {
    setError("");
    setMessage("");

    if (!addFriendEmail) {
      setError("Cannot add friend without email!");
      return;
    }

    if (addFriendEmail == authContext.user.email) {
      setError("Cannot send a friend request to yourself!");
      return;
    }

    let response = await fetch("http://localhost:8005/user/addFriend", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${authContext.user.token}`,
      },
      body: JSON.stringify({ email: addFriendEmail }),
    });

    if (response.ok) {
      setMessage("Friend request sent successfully!");
      setTimeout(() => {
        setTriggerFriendDataFetch(true);
      }, 1500);
      return;
    } else {
      const json = await response.json();
      setError(json.error);
    }
  };

  const removeFriend = async (id: string) => {
    let response = await fetch("http://localhost:8005/user/removeFriend", {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${authContext.user.token}`,
      },
      body: JSON.stringify({ id: id }),
    });

    if (response.ok) {
      setTimeout(() => {
        setTriggerFriendDataFetch(true);
      }, 1500);
    } else {
      setError("Friend removal failed!");
    }
  };

  const resolveFriendRequest = async (id: string, isAccepted: boolean) => {
    let requestResponse = isAccepted ? "accept" : "reject";

    let response = await fetch(
      "http://localhost:8005/user/handleFriendRequest",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${authContext.user.token}`,
        },
        body: JSON.stringify({ requestId: id, response: requestResponse }),
      }
    );

    if (response.ok) {
      setTimeout(() => {
        setTriggerFriendDataFetch(true);
      }, 1500);
    } else {
      alert("Friend data fecthing failed!");
      setError("Friend request handling failed!");
    }
  };

  const getUserProfileImage = async () => {
    if (!authContext || !authContext.user || !authContext.user.token) {
      console.log("No token avaiable to fetch profile image!");
      return;
    }

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
    setProfileImageObjURL(objectURL);
    setIsImageLoading(false);
    // document.getElementById("profileImage").src = objectURL;
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
  }, [authContext, triggerProfileFetch]);

  useEffect(() => {
    if (triggerFriendDataFetch) {
      if (!authContext || !authContext.user || !authContext.user.token) {
        if (!tryLoginFromToken()) {
          return;
        }
      }

      getUserFriendRequests();
      getUserFriends();
      setTriggerFriendDataFetch(false);
    } else {
      return;
    }
  }, [triggerFriendDataFetch]);

  useEffect(() => {
    // update profle data when profile context changes
    updateProfileData();
  }, [profileContext]);

  return (
    <div className="bg-prodPrimary overflow-hidden w-full sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
      <div className="w-6/12 h-7 ml-auto mr-auto mt-2 overflow-hidden flex justify-around">
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
                setTriggerFriendDataFetch(true);
                setSelectedPage("friends");
              }}
            >
              Friends
            </p>
          )}
        </div>
      </div>
      <div className="hide-scrollbar overflow-scroll w-6/12 mr-auto ml-auto">
        {selectedPage === "profile" && (
          <ProfilePage
            profileImageObjURL={profileImageObjURL}
            userName={userName}
            email={email}
            isInEditMode={isInEditMode}
            isImageLoading={isImageLoading}
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
        )}

        {selectedPage === "friends" && (
          <FriendsPage
            error={error}
            message={message}
            addFriendEmail={addFriendEmail}
            friendRequests={friendRequests}
            userFriends={userFriends}
            setAddFriendEmail={setAddFriendEmail}
            addFriend={addFriend}
            removeFriend={removeFriend}
            resolveFriendRequest={resolveFriendRequest}
            removeRequestNotification={removeRequestNotification}
            setTriggerFriendDataFetch={setTriggerFriendDataFetch}
          ></FriendsPage>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
