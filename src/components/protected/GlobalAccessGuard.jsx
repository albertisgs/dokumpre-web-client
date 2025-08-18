import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
// import { handleLogoutSession } from "../../pages/Login/handler/logoutHandler";
import { menu } from "../../configs/menu";


const GlobalAccessGuard = ({ children }) => {
  const { authState,logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userAccessList = authState.user?.access_list;

    // Hanya jalankan jika pengguna sudah login dan memiliki daftar hak akses
    if (authState.authType && userAccessList) {

      // Cari item menu yang cocok dengan path URL saat ini
      const currentMenuItem = menu.find(item => item.path === location.pathname);
      // Jika halaman saat ini ada di menu, TAPI identifier-nya TIDAK ADA
      // di dalam daftar hak akses pengguna, maka akses dicabut.
      if (currentMenuItem && !userAccessList.includes(currentMenuItem.identifier)) {
        // handleLogoutSession()
        // logout();
        // navigate('/login');
        navigate('/404', { replace: true }); 
      }
    }
  }, [authState.user, location.pathname, navigate, authState.authType, logout]); // Efek ini berjalan setiap kali data pengguna atau lokasi berubah

  return children; // Tampilkan halaman jika akses valid
};

export default GlobalAccessGuard;