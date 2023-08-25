import React from "react";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext); // user and dispatch properties

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
      console.log(authContext.user);
      authContext.dispatch({ type: "LOGIN", payload: json }); // save returned object to global state
      localStorage.setItem("user", JSON.stringify(json));
    }
  };

  return (
    <div className="login">
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
