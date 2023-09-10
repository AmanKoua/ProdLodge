import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const NavBar = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  let [triggerProfileItemsSearch, setTriggerProfileItemsSearch] =
    useState(false);

  useEffect(() => {
    let profileName;
    let profileDropdown;

    console.log("-");

    let profileInterval = setInterval(() => {
      profileName = document.getElementById("profileName");
      profileDropdown = document.getElementById("profileDropdown");

      if (profileName && profileDropdown) {
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
      }
    }, 100);

    // profileName?.addEventListener("mouseover", () => {
    //   alert("test");
    //   profileDropdown?.classList.remove("hidden");
    // });

    // profileName?.addEventListener("mouseleave", () => {
    //   profileDropdown?.classList.add("hidden");
    // });
  }, [triggerProfileItemsSearch]);

  const generateSongOptionsSection = () => {
    return (
      <>
        <div className="navbar-left-item">
          <Link to="/newSong">
            <button className="navbarButton">Create new song!</button>
          </Link>
        </div>
      </>
    );
  };

  const generateUserAuthSection = () => {
    const handleLogoutClick = () => {
      authContext.dispatch({ type: "LOGOUT", payload: undefined });
      localStorage.removeItem("user");
      navigate("/login");
    };

    if (authContext.user) {
      triggerProfileItemsSearch = !triggerProfileItemsSearch;
      return (
        <>
          <div className="bg-prodPrimary h-6 ml-auto mr-5 mt-auto mb-auto relative prodDropdown">
            <Link to="/myProfile" className="no-underline p-2" id="profileName">
              <span className="m-1 text-black border border-prodSecondary rounded-sm p-1 shadow-md hover:shadow-lg">
                {authContext.user.userName === ""
                  ? authContext.user.email
                  : authContext.user.userName}
              </span>
            </Link>
            <div
              className="absolute w-full bg-prodPrimary shadow-md border border-slate-600 mt-1 flex-col align-middle hidden"
              id="profileDropdown"
            >
              <Link
                to="/newSong"
                className="bg-slate-400 text-black no-underline text-xl"
              >
                <center>
                  <p className="w-max h-max p-2 text-black border-b-2 border-t-0 border-l-0 border-prodSecondary rounded-sm font-semibold hover:font-bold">
                    New Song
                  </p>
                </center>
              </Link>
              <Link to="/editSong" className="text-black no-underline text-xl">
                <center>
                  <p className="w-max h-max p-2 text-black border-b-2 border-prodSecondary rounded-sm font-semibold hover:font-bold">
                    Edit Song
                  </p>
                </center>
              </Link>
            </div>
            <button
              onClick={handleLogoutClick}
              className=" text-black border pl-1 pr-1 border-prodSecondary rounded-sm shadow-md hover:shadow-lg"
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
          <div className="w-max h-7 ml-auto mt-auto mb-auto mr-5">
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

  return (
    <div className="bg-prodPrimary h-16 mb-3 relative flex">
      <Link
        to="/"
        className="no-underline hover:underline decoration-prodSecondary block p-1"
      >
        <h1 className="text-black mt-auto mb-auto text-4xl p-1"> ProdLodge </h1>
      </Link>
      {generateUserAuthSection()}
    </div>
  );
};

export default NavBar;
