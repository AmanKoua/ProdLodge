import React from "react";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { EnvironmentContext } from "../context/EnvironmentContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const authContext = useContext(AuthContext); // user and dispatch properties
  const envContext = useContext(EnvironmentContext);
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

  useEffect(() => {
    // Clear error and message after a set time period of being displayed

    if (!message && !error) {
      return;
    }

    let temp = setTimeout(() => {
      setError("");
      setMessage("");
    }, 5000);

    return () => {
      clearTimeout(temp);
    };
  }, [message, error]);

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

    const response = await fetch(`${envContext.backendURL}/user/login`, {
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
    <div className="bg-gradient-to-b from-prodPrimary to-prodSecondary w-full sm:w-8/12 h-screen mr-auto ml-auto ">
      <div className="w-7/12 mr-auto ml-auto">
        <form onSubmit={handleSubmit}>
          <h3 className="w-max mr-auto ml-auto p-2 font-bold">Log In</h3>
          <div className="mr-auto ml-auto w-10/12">
            <label className="w-max mr-auto ml-auto p-2 font-bold">Email</label>
            <input
              type="email"
              value={email}
              onChange={updateEmail}
              className="w-full mr-auto ml-auto p-2"
            />
          </div>
          <div className="mr-auto ml-auto w-10/12">
            <label className="w-max mr-auto ml-auto p-2 font-bold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={updatePassword}
              className="w-full mr-auto ml-auto p-2"
            />
          </div>
          <div className="w-max mr-auto ml-auto p-2 ">
            <button className="font-bold mt-3 btn">Log in</button>
          </div>
          {error && <div className="error mt-2 mb-2 p-1">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
