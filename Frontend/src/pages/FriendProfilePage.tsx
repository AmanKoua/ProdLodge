import React from "react";
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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

  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isForbidden, setIsForbidden] = useState(false);
  const [isProfileFetched, setIsProfileFetched] = useState(false);
  const [userProfile, setUserProfile] = useState(undefined);
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
      `http://localhost:8005/user/friendProfile/${id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${authContext.user.token}` },
      }
    );

    if (response.ok) {
      const json = await response.json();
      setUserProfile(json.profile);
      setIsProfileLoading(false);
    } else if (response.status == 403) {
      setIsForbidden(true);
    } else {
      setError("Error fetching user profile");
    }
  };

  useEffect(() => {
    // Navigate to 404 page is user id is invalid
    if (id.length != 24) {
      navigate("/404");
    }
  }, []);

  useEffect(() => {
    if (!isProfileFetched) {
      getFriendProfile();
      setIsProfileFetched(true);
    }
  }, [isProfileFetched]);

  // useEffect(() => {
  //   if (!userProfile) {
  //     return;
  //   }

  //   console.log(userProfile);
  // }, [userProfile]);

  if (isProfileLoading) {
    return (
      <div className="bg-gray-500 animate-pulse overflow-hidden w-full sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
        <h3 className="text-6xl opacity-0">
          This is some sample text This is some sample textThis is some sample
          textThis is some sample text
        </h3>
      </div>
    );
  } else {
    return (
      <div className="bg-prodPrimary overflow-hidden w-full sm:w-8/12 ml-auto mr-auto flex-col jusitfy-items-center">
        <div className="w-12/12 h-max">
          <h3 className="w-max ml-auto mr-auto p-2 text-4xl font-bold">{`${userProfile.userName}'s Profile`}</h3>
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
              <h1 className="text-xl">User Name: {userProfile.userName}</h1>
            </div>
            <div className="w-max  mr-auto ">
              <h1 className="text-xl">
                soundcloud URL:
                {userProfile.socialMediaHandles.soundcloud && (
                  <a
                    href={`http://${userProfile.socialMediaHandles.soundcloud}`}
                  >
                    {userProfile.socialMediaHandles.soundcloud}
                  </a>
                )}
              </h1>
            </div>
            <div className="w-max  mr-auto ">
              <h1 className="text-xl">
                Bandcamp URL:
                {userProfile.socialMediaHandles.bandcamp && (
                  <a href={`http://${userProfile.socialMediaHandles.bandcamp}`}>
                    {userProfile.socialMediaHandles.bandcamp}
                  </a>
                )}
              </h1>
            </div>
            <div className="w-max  mr-auto ">
              <h1 className="text-xl">
                Spotify URL:
                {userProfile.socialMediaHandles.spotify && (
                  <a href={`http://${userProfile.socialMediaHandles.spotify}`}>
                    {userProfile.socialMediaHandles.spotify}
                  </a>
                )}
              </h1>
            </div>
            <div className="w-max  mr-auto ">
              <h1 className="text-xl">
                Youtube URL:
                {userProfile.socialMediaHandles.youtube && (
                  <a href={`http://${userProfile.socialMediaHandles.youtube}`}>
                    {userProfile.socialMediaHandles.youtube}
                  </a>
                )}
              </h1>
            </div>
            <div className="w-max  mr-auto ">
              <h1 className="text-xl">
                Twitter URL:
                {userProfile.socialMediaHandles.twitter && (
                  <a href={`http://${userProfile.socialMediaHandles.twitter}`}>
                    {userProfile.socialMediaHandles.twitter}
                  </a>
                )}
              </h1>
            </div>
            <div className="w-max  mr-auto ">
              <h1 className="text-xl">
                Facebook URL:
                {userProfile.socialMediaHandles.facebook && (
                  <a href={`http://${userProfile.socialMediaHandles.facebook}`}>
                    {userProfile.socialMediaHandles.facebook}
                  </a>
                )}
              </h1>
            </div>
            <div className="w-max  mr-auto ">
              <h1 className="text-xl">
                Instagram URL:
                {userProfile.socialMediaHandles.instagram && (
                  <a
                    href={`http://${userProfile.socialMediaHandles.instagram}`}
                  >
                    {userProfile.socialMediaHandles.instagram}
                  </a>
                )}
              </h1>
            </div>
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {message && <div className="message">{message}</div>}
      </div>
    );
  }
};

export default FriendProfilePage;