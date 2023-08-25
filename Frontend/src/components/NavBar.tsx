import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div className="navbar">
      <Link to="/">
        <h1> ProdLodge </h1>
      </Link>
    </div>
  );
};

export default NavBar;
