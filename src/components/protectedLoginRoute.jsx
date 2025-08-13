import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef } from "react";
import { MicrosoftLogout } from "./logoutMicrosoft";

const ProtectedLoginRoute = ({ children }) => {
  const { handleMicrosoftLogout } = MicrosoftLogout();
  const { authState, logout } = useAuth();
  const hasLoggedOut = useRef(false); // prevent infinite logout loop

  useEffect(() => {
    if (!authState.authType && !hasLoggedOut.current) {
      logout();
      hasLoggedOut.current = true;
    } else if (authState.authType === "credential" && !hasLoggedOut.current) {
      logout();
      hasLoggedOut.current = true;
    } else if (authState.authType === "microsoft" && !hasLoggedOut.current) {
      handleMicrosoftLogout();
      hasLoggedOut.current = true;
    }
  }, [authState.authType, logout, handleMicrosoftLogout]);

  // If user already has authType, go home
  if (authState.authType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedLoginRoute;
