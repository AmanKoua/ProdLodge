import React from "react";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext); // user and dispatch properties
  const navigate = useNavigate();

  const preventPageAccess = () => {
    // DO not allow a user to access the signup page if already logged in
    const item = localStorage.getItem("user");

    if (item) {
      navigate("/");
    }
  };

  useEffect(() => {
    preventPageAccess();
  }, []);

  const updateEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // stop page from reloading immediately when submitted
    setError("");

    if (!email || !password) {
      setError("Required fields missing!");
      return;
    }

    const response = await fetch("http://localhost:8005/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
      return;
    } else {
      authContext.dispatch({ type: "LOGIN", payload: json }); // save returned object to global state
      localStorage.setItem("user", JSON.stringify(json));
      navigate("/");
    }
  };

  return (
    <div className="w-4/12  h-10 bg-slate-950 THISERINO">
      <form onSubmit={handleSubmit}>
        <h3>Log In</h3>
        <label>Email</label>
        <input type="email" value={email} onChange={updateEmail} />
        <label>Password</label>
        <input type="password" value={password} onChange={updatePassword} />
        <button>Log in</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
