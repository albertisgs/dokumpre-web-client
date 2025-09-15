// src/components/protected/GlobalAccessGuard.jsx

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { menu } from "../../configs/menu";
import { useAuth } from "../../context/hooks/useAuth";


const GlobalAccessGuard = ({ children }) => {
  const { authState, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = authState.user;
    if (!authState.authType || !user) {
      return;
    }
    
    if (isSuperAdmin(user)) {
      return;
    }

    const userAccessList = user.access_list || [];
    const userPermissions = user.permissions || [];
    const currentMenuItem = menu.find(item => location.pathname.startsWith(item.path));

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
          hasAccess = false; // Hanya untuk superadmin
          break;
        // --- PERUBAHAN LOGIKA DI SINI ---
        case "agent-dashboard":
          hasAccess = userAccessList.includes("agent-dashboard") && userPermissions.includes("agent-dashboard:access");
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