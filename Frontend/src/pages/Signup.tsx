import React from "react";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { EnvironmentContext } from "../context/EnvironmentContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordDup, setPasswordDup] = useState("");
  const [userName, setUserName] = useState("");
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

  const updatePasswordDup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordDup(e.target.value);
  };
  const updateUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // stop page from reloading immediately when submitted

    setError("");

    if (!email || !password || !passwordDup || !userName) {
      setError("Required fields missing!");
      return;
    }

    if (password !== passwordDup) {
      setError("Passwords do not match!");
      return;
    }

    const response = await fetch(`${envContext.backendURL}/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, userName: userName }),
    });

    const json = await response.json();

    if (response.ok) {
      authContext.dispatch({ type: "LOGIN", payload: json }); // save returned object to global state
      localStorage.setItem("user", JSON.stringify(json));
      navigate("/");
    } else {
      setError(json.error);
    }
  };

  return (
    <div className="bg-prodPrimary w-full sm:w-8/12 h-screen mr-auto ml-auto ">
      <div className="w-7/12 mr-auto ml-auto">
        <form onSubmit={handleSubmit} className="border-b border-black pb-2">
          <h3 className="w-max mr-auto ml-auto p-2 font-bold">Sign up</h3>
          <div>
            <label className="w-max mr-auto ml-auto p-2 font-bold">Email</label>
            <input
              type="email"
              value={email}
              onChange={updateEmail}
              className="w-full mr-auto ml-auto p-2"
            />
          </div>
          <div>
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
          <div>
            <label className="w-max mr-auto ml-auto p-2 font-bold">
              Password (re-enter)
            </label>
            <input
              type="password"
              value={passwordDup}
              onChange={updatePasswordDup}
              className="w-full mr-auto ml-auto p-2"
            />
          </div>
          <div>
            <label className="w-max mr-auto ml-auto p-2 font-bold">
              User Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={updateUserName}
              className="w-full mr-auto ml-auto p-2"
            />
          </div>
          <div className="w-max mr-auto ml-auto p-2 mt-4">
            <button className="btn">Sign up</button>
          </div>

          {error && <div className="error">{error}</div>}
        </form>
        <div className="w-max h-max ml-auto mr-auto mt-3 flex-col">
          <p className="w-max font-bold justify-self-start block">
            New here? Check out the about page
          </p>
          <div className="w-max ml-auto mr-auto">
            <button
              className="btn"
              onClick={() => {
                navigate("/about");
              }}
            >
              about
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
