import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const NavBar = () => {
  const authContext = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

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
          <div>
            <Link to="/myProfile">
              <span>
                {authContext.user.userName === ""
                  ? authContext.user.email
                  : authContext.user.userName}
              </span>
            </Link>
            <button className="userAuthButton" onClick={handleLogoutClick}>
              logout
            </button>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div>
            <Link to="/login">
              <button className="userAuthButton">Login</button>
            </Link>
            <Link to="/signup">
              <button className="userAuthButton">Sign Up</button>
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
