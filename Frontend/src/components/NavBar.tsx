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
      authContext.dispatch({ type: "LOGOUT", payload: undefined });
      localStorage.removeItem("user");
      navigate("/login");
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
              <Link to="/newSong">
                <center>
                  <p style={{ border: "1px solid black" }}>New Song</p>
                </center>
              </Link>
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
