import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axios/axiosInstance";
import { useEffect } from "react";
import { MicrosoftLogout } from "./logoutMicrosoft";


const ProtectedLoginRoute = ({ children }) => {
  const {handleMicrosoftLogout} = MicrosoftLogout()
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
    }else if (authState.authType === "microsoft" && authState.id_token) {
      axiosInstance.general.get('api/authazure/verify-token', {
        headers: {
          Authorization: `Bearer ${authState.id_token}`,
        },
      })
      .catch(() => {
        handleMicrosoftLogout()
      });
    }
  }, [authState, logout, handleMicrosoftLogout]);

  if (authState.token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedLoginRoute;