// src/components/protected/GlobalAccessGuard.jsx

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { menu } from "../../configs/menu";
import { useAuth } from "../../context/hooks/useAuth";


const GlobalAccessGuard = ({ children }) => {
  const { authState, isSuperAdmin } = useAuth(); // Ambil isSuperAdmin
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = authState.user;
    // Hanya jalankan jika pengguna sudah login
    if (!authState.authType || !user) {
      return;
    }
    
    // Superadmin selalu diizinkan
    if (isSuperAdmin(user)) {
      return;
    }

    const userAccessList = user.access_list || [];
    const userPermissions = user.permissions || [];
    const currentMenuItem = menu.find(item => item.path === location.pathname);

    if (currentMenuItem) {
      const { identifier } = currentMenuItem;
      let hasAccess = false;

      // Cek akses berdasarkan identifier
      switch (identifier) {
        case "user-management":
          hasAccess = userPermissions.includes("user-management:master");
          break;
        case "role-management":
          hasAccess = userPermissions.includes("role-management:master");
          break;
        case "team-management":
          hasAccess = false; // Hanya untuk superadmin, akan selalu false di sini
          break;
        default:
          // Untuk halaman lain, cek berdasarkan access_list
          hasAccess = userAccessList.includes(identifier);
          break;
      }

      if (!hasAccess) {
        navigate('/404', { replace: true });
      }
    }

  }, [authState, location.pathname, navigate, isSuperAdmin]);

  return children;
};

export default GlobalAccessGuard;