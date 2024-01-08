import React from "react";
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { EnvironmentContext } from "../context/EnvironmentContext";

import { FriendProfile } from "../customTypes";

// interface FriendProfilePageProps {
//   userName: string;
//   isImageLoading: boolean;

//   soundcloudURL: string;
//   bandcampURL: string;
//   spotifyURL: string;
//   youtubeURL: string;
//   twitterURL: string;
//   facebookURL: string;
//   instagramURL: string;

//   error: string;
//   message: string;
// }

const FriendProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const envContext = useContext(EnvironmentContext);

  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isForbidden, setIsForbidden] = useState(false);
  const [isProfileFetched, setIsProfileFetched] = useState(false);
  const [userProfile, setUserProfile] = useState<FriendProfile | undefined>(
    undefined
  );
  const [profileImageObjURL, setProfileImageObjURL] = useState("");

  const tryLoginFromToken = () => {
    const user = localStorage.getItem("user");
    if (user) {
      authContext.dispatch({ type: "LOGIN", payload: JSON.parse(user) }); // save returned object to global state
      return true;
    } else {
      return false;
    }
  };

  const getFriendProfile = async () => {
    if (!(authContext && authContext.user && authContext.user.token)) {
      console.log("authContext not initialized!");

      if (tryLoginFromToken()) {
        setTimeout(() => {
          setIsProfileFetched(false);
        }, 10);
      }
      return;
    }

    const response = await fetch(
      `${envContext.backendURL}/user/friendProfile/${id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${authContext.user.token}` },
      }
    );

    if (response.ok) {
      const json = await response.json();

      // console.log("-------------------------");
      // console.log(json);
      // console.log("------------------------");

      setUserProfile(json.profile);
      setIsProfileLoading(false);
    } else if (response.status == 403) {
      setIsProfileLoading(false);
      setIsForbidden(true);
    } else {
      setError("Error fetching user profile");
    }
  };

  const getFriendProfileImage = async () => {
    if (!authContext || !authContext.user || !authContext.user.token) {
      if (!tryLoginFromToken()) {
        return;
      }
    }

    if (!userProfile) {
      return;
    }

    const response = await fetch(
      `${envContext.backendURL}/user/friendProfileImage`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8", // content type seems to fix CORS errors...
          Authorization: `Bearer ${authContext.user.token}`,
          friendId: `${id}`,
        },
      }
    );

    if (!response.ok) {
      console.log("Failed fetching profile image!");
      const temp = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; // Temporary icon.
      setProfileImageObjURL(temp);
      setIsImageLoading(false);
      return;
    }

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    setProfileImageObjURL(objectURL);
    setIsImageLoading(false);
  };

  useEffect(() => {
    // Navigate to 404 page is user id is invalid
    if (id!.length != 24) {
      navigate("/404");
    }
  }, []);

  useEffect(() => {
    if (!isProfileFetched) {
      getFriendProfile();
      setIsProfileFetched(true);
    }
  }, [isProfileFetched]);

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    getFriendProfileImage();
  }, [userProfile]);

  if (isProfileLoading) {
    return (
      <div className="bg-blue-100 animate-pulse overflow-hidden w-full sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
        <h3 className="text-6xl opacity-0">
          This is some sample text This is some sample textThis is some sample
          textThis is some sample text
        </h3>
      </div>
    );
  } else if (!isProfileLoading && isForbidden) {
    return (
      <div className="bg-gradient-to-b from-prodPrimary to-prodSecondary shadow-xl shadow-blue-200 overflow-hidden w-full sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
        <div className="bg-prodPrimary w-full h-screen pt-40">
          <div className=" w-7/12 h-max ml-auto mr-auto bg-prodSecondary rounded-lg z-50">
            <h3 className="ml-auto mr-auto p-5 font-bold text-4xl">
              We're sorry, but you cannot access this user's profile!
            </h3>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-gradient-to-b from-prodPrimary to-prodSecondary shadow-xl shadow-blue-200 overflow-hidden w-full h-screen sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
        <div className="w-6/12 h-max ml-auto mr-auto">
          <h3 className="w-max ml-auto mr-auto p-2 text-4xl font-bold">{`${
            userProfile!.userName
          }'s Profile`}</h3>
          <div className="w-5/12 h-max ml-auto mr-auto overflow-hidden">
            {/* Temp Image */}
            {!isImageLoading && (
              <img
                className="w-64 ml-auto mr-auto rounded-3xl object-cover"
                src={profileImageObjURL}
                id="profileImage"
              ></img>
            )}
            {isImageLoading && (
              <div className="h-full w-full bg-gray-500 ml-auto mr-auto rounded-3xl animate-pulse block">
                {/*Text is requied to giv placeholder div dimension*/}
                <h1 className="opacity-0">
                  This is sample text his is sample text here
                </h1>
              </div>
            )}
          </div>
          <div className="overflow-hidden w-max ml-auto mr-auto mt-3 mb-3 border-prodSecondary border-t-2 border-b-2">
            <div className="w-max  mr-auto ">
              <h1 className="text-xl">User Name: {userProfile!.userName}</h1>
            </div>

            {userProfile!.socialMediaHandles == null && <></>}
            {userProfile!.socialMediaHandles != null && (
              <>
                <div className="w-max  mr-auto ">
                  <h1 className="text-xl">
                    soundcloud URL:{" "}
                    {userProfile!.socialMediaHandles.soundcloud && (
                      <a
                        href={`http://${
                          userProfile!.socialMediaHandles.soundcloud
                        }`}
                      >
                        {userProfile!.socialMediaHandles.soundcloud}
                      </a>
                    )}
                  </h1>
                </div>
                <div className="w-max  mr-auto ">
                  <h1 className="text-xl">
                    Bandcamp URL:{" "}
                    {userProfile!.socialMediaHandles.bandcamp && (
                      <a
                        href={`http://${
                          userProfile!.socialMediaHandles.bandcamp
                        }`}
                      >
                        {userProfile!.socialMediaHandles.bandcamp}
                      </a>
                    )}
                  </h1>
                </div>
                <div className="w-max  mr-auto ">
                  <h1 className="text-xl">
                    Spotify URL:{" "}
                    {userProfile!.socialMediaHandles.spotify && (
                      <a
                        href={`http://${
                          userProfile!.socialMediaHandles.spotify
                        }`}
                      >
                        {userProfile!.socialMediaHandles.spotify}
                      </a>
                    )}
                  </h1>
                </div>
                <div className="w-max  mr-auto ">
                  <h1 className="text-xl">
                    Youtube URL:{" "}
                    {userProfile!.socialMediaHandles.youtube && (
                      <a
                        href={`http://${
                          userProfile!.socialMediaHandles.youtube
                        }`}
                      >
                        {userProfile!.socialMediaHandles.youtube}
                      </a>
                    )}
                  </h1>
                </div>
                <div className="w-max  mr-auto ">
                  <h1 className="text-xl">
                    Twitter URL:{" "}
                    {userProfile!.socialMediaHandles.twitter && (
                      <a
                        href={`http://${
                          userProfile!.socialMediaHandles.twitter
                        }`}
                      >
                        {userProfile!.socialMediaHandles.twitter}
                      </a>
                    )}
                  </h1>
                </div>
                <div className="w-max  mr-auto ">
                  <h1 className="text-xl">
                    Facebook URL:{" "}
                    {userProfile!.socialMediaHandles.facebook && (
                      <a
                        href={`http://${
                          userProfile!.socialMediaHandles.facebook
                        }`}
                      >
                        {userProfile!.socialMediaHandles.facebook}
                      </a>
                    )}
                  </h1>
                </div>
                <div className="w-max  mr-auto ">
                  <h1 className="text-xl">
                    Instagram URL:{" "}
                    {userProfile!.socialMediaHandles.instagram && (
                      <a
                        href={`http://${
                          userProfile!.socialMediaHandles.instagram
                        }`}
                      >
                        {userProfile!.socialMediaHandles.instagram}
                      </a>
                    )}
                  </h1>
                </div>
              </>
            )}
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {message && <div className="message">{message}</div>}
      </div>
    );
  }
};

export default FriendProfilePage;
