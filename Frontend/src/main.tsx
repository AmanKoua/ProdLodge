import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";
import { ProfileContextProvider } from "./context/ProfileContext";
import "bootstrap/dist/css/bootstrap.css"; // css library that works with react

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthContextProvider>
      <ProfileContextProvider>
        <App />
      </ProfileContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
