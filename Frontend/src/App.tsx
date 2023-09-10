import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";

import AudioBox from "./audioComponents/AudioBox";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserProfile from "./pages/UserProfile";
import NewSong from "./pages/NewSong";
import EditSong from "./pages/EditSong";

import { AuthContext } from "./context/AuthContext";

// import "./index.css"; // old pre-tailwind css
import "./styles.css";

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw Error(
      "useAuthContext cannot be used outisde the scope of the useAuthContext context!"
    );
  }

  return context;
};

function App() {
  let authContext = useAuthContext();

  useEffect(() => {
    // log user in if still authenticated

    let user = localStorage.getItem("user");

    if (!user) {
      // user is not authenticated
      authContext.dispatch({ type: "LOGOUT", payload: {} });
      return;
    } else {
      // check that token is still valid before logging in

      const token = JSON.parse(user).token;
      const tokenCreationTime = JSON.parse(user).tokenCreationTime;

      const verifyToken = async () => {
        const isTokenExpired =
          Math.abs(Date.now() - parseInt(tokenCreationTime)) > 259200000; // If longer than 3 days in ms, invalidate token

        if (isTokenExpired) {
          localStorage.removeItem("user");
          authContext.dispatch({ type: "LOGOUT", payload: {} });
          return;
        } else {
          authContext.dispatch({ type: "LOGIN", payload: JSON.parse(user) }); // set context state to stored user
          return;
        }
      };

      verifyToken();
    }
  }, []);

  return (
    <div className="app w-full h-screen">
      <BrowserRouter>
        <NavBar />
        <div className="pages">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/myProfile" element={<UserProfile />} />
            <Route path="/newSong" element={<NewSong />} />
            <Route path="/editSong" element={<EditSong />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
