import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const AdminLoginAuth = ({ children }) => {
  const admin = useSelector((state) => state.admin.admin);
  const token = useSelector((state) => state.admin.token); 
  const location = useLocation();

  console.log("Admin authentication state in AdminLoginAuth:", admin);

 if (!admin || !token) { 
    console.log("Redirecting to /admin, as admin is not authenticated.");
    return (
      <Navigate 
        to="/" 
        state={{ from: location }} 
        replace 
      />
    );
  }

 return children;
};

export default AdminLoginAuth;