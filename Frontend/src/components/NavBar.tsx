import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ProfileContext } from "../context/ProfileContext";

const NavBar = () => {
  const authContext = useContext(AuthContext);
  const profileContext = useContext(ProfileContext);
  const navigate = useNavigate();
  let [triggerProfileItemsSearch, setTriggerProfileItemsSearch] =
    useState(false);

  useEffect(() => {
    let profileName;
    let profileDropdown: HTMLElement;
    let user;

    let profileInterval = setInterval(() => {
      profileName = document.getElementById("profileName");
      profileDropdown = document.getElementById("profileDropdown")!;
      user = localStorage.getItem("user");

      if (user) {
        profileName = document.getElementById("profileName");
        profileDropdown = document.getElementById("profileDropdown")!;

        if (profileName && profileDropdown) {
          profileName.addEventListener("mouseenter", () => {
            if (profileDropdown.classList.contains("hidden")) {
              profileDropdown.classList.remove("hidden");
            }
          });

          profileName.addEventListener("mouseleave", () => {
            if (!profileDropdown.classList.contains("hidden")) {
              profileDropdown.classList.add("hidden");
            }
          });

          profileDropdown.addEventListener("mouseenter", () => {
            if (profileDropdown.classList.contains("hidden")) {
              profileDropdown.classList.remove("hidden");
            }
          });

          profileDropdown.addEventListener("mouseleave", () => {
            if (!profileDropdown.classList.contains("hidden")) {
              profileDropdown.classList.add("hidden");
            }
          });
        }

        clearInterval(profileInterval);
      } else {
        clearInterval(profileInterval);
      }
    }, 100);
  }, [localStorage.getItem("user")]);

  const generateSongOptionsSection = () => {
    return (
      <>
        <div className="navbar-left-item">
          <Link to="/newSong">
            <button className="btn">Create new song!</button>
          </Link>
        </div>
      </>
    );
  };

  const generateUserAuthSection = () => {
    const handleLogoutClick = () => {
      profileContext.dispatch({ type: "DELETE", payload: undefined });
      authContext.dispatch({ type: "LOGOUT", payload: undefined });
      localStorage.removeItem("user");
      navigate("/login");
    };

    if (authContext.user) {
      triggerProfileItemsSearch = !triggerProfileItemsSearch;
      return (
        <>
          <div className="w-max h-6 ml-auto mr-auto sm:mr-5 mt-auto mb-auto relative">
            <Link to="/myProfile" className="no-underline p-2" id="profileName">
              <span className="m-1 text-black border border-prodSecondary rounded-sm p-1 shadow-sm hover:shadow-lg">
                {authContext.user.userName === ""
                  ? authContext.user.email
                  : authContext.user.userName}
              </span>
            </Link>
            <div
              className="absolute w-full bg-prodPrimary shadow-md border border-slate-600 mt-1 flex-col align-middle z-10 hidden"
              id="profileDropdown"
            >
              <Link
                to="/newSong"
                className="bg-slate-400 text-black no-underline text-xl"
              >
                <center>
                  <p className="w-max h-max mt-2 p-2 shadow-sm text-black border-b-2 border-t-0 border-l-0 border-prodSecondary rounded-sm font-semibold hover:font-bold">
                    New Song
                  </p>
                </center>
              </Link>
              <Link to="/editSong" className="text-black no-underline text-xl">
                <center>
                  <p className="w-max h-max p-2 shadow-sm text-black border-b-2 border-prodSecondary rounded-sm font-semibold hover:font-bold">
                    Edit Song
                  </p>
                </center>
              </Link>
              <Link
                to="/about"
                className="bg-slate-400 text-black no-underline text-xl"
              >
                <center>
                  <p className="w-max h-max mt-2 p-2 shadow-sm text-black border-b-2 border-t-0 border-l-0 border-prodSecondary rounded-sm font-semibold hover:font-bold">
                    About
                  </p>
                </center>
              </Link>
            </div>
            <button
              onClick={handleLogoutClick}
              className="text-black border pl-1 pr-1 border-prodSecondary rounded-sm shadow-sm hover:shadow-lg"
            >
              logout
            </button>
          </div>
        </>
      );
    } else {
      triggerProfileItemsSearch = !triggerProfileItemsSearch;
      return (
        <>
          <div className="w-max h-7 ml-auto mr-auto sm:mr-5 mt-auto mb-auto">
            <Link
              to="/login"
              className="m-1 text-black border border-prodSecondary rounded-sm p-1 shadow-md hover:shadow-lg"
            >
              <button className="navbarButton">Login</button>
            </Link>
            <Link
              to="/signup"
              className="m-1 text-black border border-prodSecondary rounded-sm p-1 shadow-md hover:shadow-lg"
            >
              <button className="navbarButton">Sign Up</button>
            </Link>
          </div>
        </>
      );
    }
  };

  const generateProdlodgeBanner = (): JSX.Element => {
    const token = localStorage.getItem("user");

    if (token) {
      return (
        <Link
          to="/home"
          className="ml-auto mr-auto sm:ml-0 sm:mr-0 w-max no-underline hover:underline decoration-prodSecondary block p-1"
        >
          <h1 className="text-black mt-auto mb-auto text-4xl p-1">ProdLodge</h1>
        </Link>
      );
    } else {
      return (
        <Link
          to="/"
          className="ml-auto mr-auto sm:ml-0 sm:mr-0 w-max no-underline hover:underline decoration-prodSecondary block p-1"
        >
          <h1 className="text-black mt-auto mb-auto text-4xl p-1">ProdLodge</h1>
        </Link>
      );
    }

    return <></>;
  };

  return (
    <div className="bg-prodPrimary h-max mb-2 pb-2 sm:pb-0 sm:flex justify-center">
      {generateProdlodgeBanner()}
      {generateUserAuthSection()}
    </div>
  );
};

export default NavBar;
