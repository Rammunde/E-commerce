import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateComponent = () => {
    const user = useSelector((state) => state.app.user);
    const isAuthenticated = user && (user.data || user._id);
    return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

export default PrivateComponent

