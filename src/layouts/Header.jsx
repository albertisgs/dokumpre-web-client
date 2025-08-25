import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";

import { MicrosoftLogout } from "../pages/Login/handler/logoutMicrosoft";
import { menu } from "../configs/menu";
import { handleLogoutSession } from "../pages/Login/handler/logoutHandler";
import { useAuth } from "../context/hooks/UseAuth";

const Header = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const [title, setTitle] = useState("");

  const [showMenu, setShowMenu] = useState(false);

  const { logout, authState } = useAuth();

  const menuRef = useRef();

  const { handleMicrosoftLogout } = MicrosoftLogout();

   useEffect(() => {
    const currentMenuItem = menu.find(item => item.path === location.pathname);
    if (currentMenuItem) {
      setTitle(currentMenuItem.title);
    } else if (location.pathname === "/") {
      setTitle("Dashboard"); // Fallback untuk root path
    } else {
      setTitle(""); // Atau judul default lain
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    if (authState.authType === "microsoft") {
      await handleMicrosoftLogout();

      await handleLogoutSession();

      logout();
    } else if (authState.authType === "google") {
      await handleLogoutSession();

      logout();

      // navigate("/login");
    } else if (authState.authType === "credential") {
      await handleLogoutSession();

      logout();

      // navigate("/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex flex-row bg-[#F9FAFB] justify-between items-center ">
      <h1 className="text-3xl font-bold mx-10">{title}</h1>

      <div
        className="flex items-center gap-4 relative cursor-not-allowed"
        ref={menuRef}
      >
        <img src="/active.svg" className="w-7 h-7" />

        <div className="relative z-30">
          <img
            src={
              authState?.authType === "google"
                ? authState.user.picture
                : "/avatar.svg"
            }
            className="w-10 h-10 cursor-pointer rounded-full"
            onClick={() => setShowMenu((prev) => !prev)}
            referrerPolicy="no-referrer"
          />

          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
