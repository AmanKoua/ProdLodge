import { useContext, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import AudioBox from "./audioComponents/AudioBox";
import NavBar from "./components/NavBar";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserProfile from "./pages/UserProfile";
import FriendProfilePage from "./pages/FriendProfilePage";
import NewSong from "./pages/NewSong";
import EditSong from "./pages/EditSong";
import About from "./pages/About";
import InvalidRoute from "./pages/InvalidRoute";

import { AuthContext } from "./context/AuthContext";

// import "./index.css"; // old pre-tailwind css
import "./invisibleScrollbar.css"; // Styles for hiding scrollbar in audio modules
import "locomotive-scroll/dist/locomotive-scroll.css"; // Styles require for locomotive scroll
import "./styles.css"; // tailwindcss styles

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
  const containerRef = useRef(null);
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
          authContext.dispatch({ type: "LOGIN", payload: JSON.parse(user!) }); // set context state to stored user
          return;
        }
      };

      verifyToken();
    }
  }, []);

  return (
    <div className="app w-full h-screen scroll-smooth">
      {/* <BrowserRouter> */}
      <NavBar />
      <main>
        <div
          id="ProdLodgePagesDiv"
          className="flex"
          style={{ minHeight: "102vh" }}
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/myProfile" element={<UserProfile />} />
            <Route
              path="/userProfile/:id"
              element={<FriendProfilePage />}
            ></Route>
            <Route path="/newSong" element={<NewSong />} />
            <Route path="/editSong" element={<EditSong />} />
            <Route path="/about" element={<About />} />
            <Route path="/404" element={<InvalidRoute />} />
            <Route path="*" element={<Navigate to="/404" />} />
            {/* Catch all for unregistered routes */}
          </Routes>
        </div>
      </main>
      {/* </BrowserRouter> */}
    </div>
  );
}

export default App;
