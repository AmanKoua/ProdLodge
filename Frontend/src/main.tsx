import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { EnvironmentContextProvider } from "./context/EnvironmentContext";
import { ProfileContextProvider } from "./context/ProfileContext";
import "bootstrap/dist/css/bootstrap.css"; // css library that works with react

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // Remove Strict mode to prevent useEffect hooks from running 2 times!
  <React.StrictMode>
    <EnvironmentContextProvider>
      <AuthContextProvider>
        <ProfileContextProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ProfileContextProvider>
      </AuthContextProvider>
    </EnvironmentContextProvider>
  </React.StrictMode>
);
