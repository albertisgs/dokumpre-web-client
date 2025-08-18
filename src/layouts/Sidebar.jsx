import { useState, useEffect, useMemo } from "react";

import { Link, useLocation } from "react-router-dom";

import { menu } from "../configs/menu";

import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const [currentPath, setCurrentPath] = useState("");

  const location = useLocation();

  const { authState } = useAuth();

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const accessibleMenu = useMemo(() => {
    // PERBAIKAN: Logika dipindahkan ke dalam useMemo

    const userAccessList = authState.user?.access_list || [];

    // Filter menu berdasarkan hak akses dari backend

    return menu.filter((item) => userAccessList.includes(item.identifier));
  }, [authState.user]); // PERBAIKAN: Bergantung langsung pada objek user

  const isActive = (path) => {
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  return (
    <nav className="fixed top-0 left-0 h-screen w-20 md:w-72 bg-[#ebf2ff] text-[#374151] flex flex-col shadow-md transition-all duration-300">
      <div className="flex items-center justify-center md:justify-start h-20 px-4 mt-6 mb-6">
        <img src="/Dokuprime.svg" alt="Logo" className="w-[90%] pl-4" />
      </div>

      <div className="flex-1 px-2 md:px-4 py-6 space-y-2 overflow-y-auto sidebar-scroll">
        {accessibleMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`group flex items-center justify-center md:justify-start px-3 md:px-4 py-2.5 rounded-lg mx-2 transition-colors duration-200 font-open-sans text-[16px] font-medium sidebar-link ${
              isActive(item.path)
                ? "bg-blue-100 text-blue-800"
                : "hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            {typeof item.icon === "string" ? (
              <img
                src={item.icon}
                alt={`${item.title} Icon`}
                className="w-5 h-5 md:mr-3 transition-all group-hover:filter group-hover:brightness-90"
              />
            ) : (
              <item.icon className="w-5 h-5 md:mr-3" />
            )}

            <span className="hidden md:inline">{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
