import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectHome({children}){
    const {user}= useSelector((state) => state.user);
    if(!user || !user.id){
        return <Navigate to='/' />
    }
    return children;
}

export default ProtectHome;