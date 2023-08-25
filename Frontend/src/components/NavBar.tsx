import React from "react";
import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const NavBar = () => {
  const authContext = useContext(AuthContext);

  const generateUserAuthSection = () => {
    const handleLogoutClick = () => {
      localStorage.removeItem("user");
      authContext.dispatch({ type: "LOGOUT", payload: undefined });
    };

    if (authContext.user) {
      return (
        <>
          <div>
            <span>
              {authContext.user.userName === ""
                ? authContext.user.email
                : authContext.user.userName}
            </span>
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
