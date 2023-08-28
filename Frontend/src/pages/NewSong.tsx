import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SongUploadContainer from "../components/SongUploadContainer";

const NewSong = () => {
  const [songUploadData, setSongUploadData] = useState([]); // arr of JSON objects representing tracks
  const navigate = useNavigate();

  const preventPageAccess = () => {
    // DO not allow a user to access the profile page if not logged in OR if profile has yet to be set
    const item = localStorage.getItem("user");

    if (!item) {
      navigate("/login");
    }
  };

  useEffect(() => {
    /*
      TODO : Remove after testing is completed!
    */

    return;

    preventPageAccess();
  }, []);

  const generateSongUploadContainers = (): JSX.Element => {
    return (
      <>
        <SongUploadContainer></SongUploadContainer>
        <SongUploadContainer></SongUploadContainer>
        <SongUploadContainer></SongUploadContainer>
        <SongUploadContainer></SongUploadContainer>
      </>
    );
  };

  return (
    <div className="mainArea">
      <h3>Upload a new song!</h3>
      {generateSongUploadContainers()}
    </div>
  );
};

export default NewSong;
