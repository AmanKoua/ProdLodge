import React from "react";
import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const NavBar = () => {
  const authContext = useContext(AuthContext);

  return (
    <div className="navbar">
      <Link to="/">
        <h1> ProdLodge </h1>
      </Link>
    </div>
  );
};

export default NavBar;
