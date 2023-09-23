import React from "react";
import { useParams } from "react-router-dom";

const FriendProfilePage = () => {
  const { id } = useParams();
  return <div>FriendProfilePage</div>;
};

export default FriendProfilePage;
