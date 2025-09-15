import { useEffect, useRef } from "react";

import { MicrosoftLogout } from "../../pages/Login/handler/logoutMicrosoft";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/hooks/useAuth";
import { Loader2 } from "lucide-react";



const ProtectedLoginRoute = ({ children }) => {
  const { handleMicrosoftLogout } = MicrosoftLogout();
  const { authState, logout,  isInitializing} = useAuth();
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


   useEffect(() => {
    // Jangan lakukan apa pun selama sesi masih diverifikasi
    if (isInitializing) {
      return;
    }

    // Setelah verifikasi selesai, jika pengguna terautentikasi, alihkan mereka
    if (authState.authType) {
      navigate("/", { replace: true });
    }
  }, [authState.authType, isInitializing, navigate]);

  // Selama inisialisasi, tampilkan loader untuk mencegah "blink"
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Jika verifikasi selesai dan pengguna TIDAK login, tampilkan halaman login
  if (!authState.authType) {
    return children;
  }

  // Selama proses pengalihan, jangan render apa pun
  return null;
};

export default ProtectedLoginRoute;
