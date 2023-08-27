import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const NavBar = () => {
  const authContext = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

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
      localStorage.removeItem("user");
      authContext.dispatch({ type: "LOGOUT", payload: undefined });

      if (location.pathname === "/myProfile") {
        // if logging out on profile page, redirect to home page
        navigate("/");
      }
    };

    if (authContext.user) {
      return (
        <>
          <div className="navbar-right-item">
            <Link to="/myProfile" className="userName">
              <span>
                {authContext.user.userName === ""
                  ? authContext.user.email
                  : authContext.user.userName}
              </span>
            </Link>
            <div className="userNameDropDown">
              <a>link1</a>
              <a>link2</a>
              <a>link3</a>
            </div>
            <button className="navbarButton" onClick={handleLogoutClick}>
              logout
            </button>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="navbar-right-item">
            <Link to="/login">
              <button className="navbarButton">Login</button>
            </Link>
            <Link to="/signup">
              <button className="navbarButton">Sign Up</button>
            </Link>
          </div>
        </>
      );
    }
  };

  return (
    <div className="navbar">
      <Link to="/">
        <h1> ProdLodge </h1>
      </Link>
      {generateUserAuthSection()}
    </div>
  );
};

export default NavBar;
