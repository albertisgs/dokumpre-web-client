import { useEffect, useRef } from "react";

import { MicrosoftLogout } from "../../pages/Login/handler/logoutMicrosoft";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/hooks/useAuth";



const ProtectedLoginRoute = ({ children }) => {
  const { handleMicrosoftLogout } = MicrosoftLogout();
  const { authState, logout } = useAuth();
  const hasLoggedOut = useRef(false); // prevent infinite logout loop
  const navigate = useNavigate()
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
    return navigate('/', { replace: true }); ;
  }

  return children;
};

export default ProtectedLoginRoute;
