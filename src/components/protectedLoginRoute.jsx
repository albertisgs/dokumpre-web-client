import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axios/axiosInstance";
import { useEffect } from "react";

const ProtectedLoginRoute = ({ children }) => {
  const { authState, logout } = useAuth();
  
  useEffect(() => {
    if (authState.authType === "credential" && authState.token) {
      axiosInstance.general.get('api/auth/verify-token', {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      })
      .catch(() => {
        logout();
      });
    }
  }, [authState, logout]);

  if (authState.token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedLoginRoute;