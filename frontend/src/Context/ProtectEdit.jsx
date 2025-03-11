import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectEdit({ children }) {
  const { user } = useSelector((state) => state.user);
  // Checking if user exists 
  if (user && user.id) {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

export default ProtectEdit;