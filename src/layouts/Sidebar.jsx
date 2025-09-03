import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { menu } from "../configs/menu";
import { useAuth } from "../context/hooks/useAuth";
import { useAgentStore } from "./store/useAgentStore";
import { Clock, MessageSquare } from "lucide-react";
import AgentSidebarSection from "./components/AgentSidebarSection";

const ChatListItem = ({ chat, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`px-5 py-4 border-b border-gray-100 cursor-pointer transition-all duration-200 relative ${
      isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50"
    }`}
  >
    <div className="flex justify-between items-center mb-1">
      <div className="font-semibold text-sm text-gray-800 truncate">
        {chat.user_name}
      </div>
      <div className="text-xs text-gray-500">
        {new Date(chat.created_at || chat.claimed_at).toLocaleTimeString(
          "id-ID",
          { hour: "2-digit", minute: "2-digit" }
        )}
      </div>
    </div>
    <div className="text-xs text-gray-600 line-clamp-2">
      {isActive ? "Percakapan sedang berlangsung..." : "Menunggu di antrian..."}
    </div>
  </div>
);

const Sidebar = () => {
  const [currentPath, setCurrentPath] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { authState, isSuperAdmin } = useAuth();
  // Mengambil state dan actions dari Zustand store
  const { queue, activeChat, initialize, claimChat, managePresence } = useAgentStore();

  const showAgentSection = useMemo(() => {
    return authState.user?.permissions?.includes("agent-dashboard:access");
  }, [authState.user]);

  // Inisialisasi data agen saat komponen dimuat jika ada izin
  useEffect(() => {
    if (showAgentSection) {
            initialize();
            const cleanupPresence = managePresence(); // Panggil action dan simpan fungsi cleanup-nya

            // Return fungsi cleanup agar listener dihapus saat user logout / kehilangan akses
            return () => {
                if (cleanupPresence) {
                    cleanupPresence();
                }
            };
        }
    }, [showAgentSection, initialize, managePresence]);

  const handleChatSelect = async (sessionId) => {
    // Jika chat yang dipilih belum aktif, klaim dulu
    if (activeChat?.id !== sessionId) {
      try {
        await claimChat(sessionId);
        navigate(`/agent-dashboard/${sessionId}`);
      } catch (error) {
        // error sudah ditangani di store
      }
    } else {
      // Jika sudah aktif, cukup navigasi
      navigate(`/agent-dashboard/${sessionId}`);
    }
  };

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const accessibleMenu = useMemo(() => {
    const user = authState.user;
    // PERBAIKAN: Logika dipindahkan ke dalam useMemo

    const userAccessList = user?.access_list || [];
    const userPermissions = user?.permissions || [];
    const userIsSuperAdmin = isSuperAdmin(user);

    // Filter menu berdasarkan hak akses dari backend

    return menu.filter((item) => {
      // Jika user adalah Superadmin, tampilkan semua
      if (userIsSuperAdmin) {
        return true;
      }

      // Logika baru untuk menu yang butuh permission khusus
      if (item.identifier === "user-management") {
        return userPermissions.includes("user-management:master");
      }
      if (item.identifier === "role-management") {
        return userPermissions.includes("role-management:master");
      }
      if (item.identifier === "team-management") {
        return false; // Hanya untuk superadmin, jadi filter di sini
      }

      // Logika lama untuk menu lainnya (berdasarkan akses modul)
      return userAccessList.includes(item.identifier);
    });
  }, [authState.user, isSuperAdmin]); // PERBAIKAN: Bergantung langsung pada objek user

  const isActive = (path) => {
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  return (
    <nav className="fixed top-0 left-0 h-screen w-20 md:w-72 bg-[#ebf2ff] text-[#374151] flex flex-col shadow-md transition-all duration-300 z-50">
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

      {showAgentSection && (
        <div className="flex flex-col min-h-0">
          {/* Agent Status Section */}
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 hidden md:block">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                {authState.user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-700">
                  {authState.user?.name}
                </div>
                <div className="text-xs text-gray-500">Support Agent</div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex justify-around mt-2">
              <div className="text-center">
                <span className="block font-semibold text-base text-gray-700">
                  {activeChat ? 1 : 0}
                </span>
                <span className="text-xs text-gray-500">Aktif</span>
              </div>
              <div className="text-center">
                <span className="block font-semibold text-base text-gray-700">
                  {queue.length}
                </span>
                <span className="text-xs text-gray-500">Antrian</span>
              </div>
              <div
                className="text-center cursor-pointer"
                onClick={() => navigate("/agent-dashboard/history")}
              >
                <span className="block font-semibold text-base text-gray-700">
                  -
                </span>
                <span className="text-xs text-gray-500">Riwayat</span>
              </div>
            </div>
          </div>

          <AgentSidebarSection/>

          {/* Chat Lists */}
          <div className="flex-1 overflow-y-auto hidden md:block">
            {/* Sesi Aktif */}
            {activeChat && (
              <>
                <div className="px-5 py-2 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-700 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" /> Sesi Aktif
                </div>
                <ChatListItem
                  chat={activeChat}
                  isActive={true}
                  onClick={() => navigate(`/agent-dashboard/${activeChat.id}`)}
                />
              </>
            )}

            {/* Antrian */}
            <div className="px-5 py-2 bg-gray-100 border-y border-gray-200 text-xs font-semibold text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-2" /> Antrian Chat ({queue.length})
            </div>
            {queue.length > 0 ? (
              queue.map((chat) => (
                <ChatListItem
                  key={chat.session_id}
                  chat={chat}
                  isActive={false}
                  onClick={() => handleChatSelect(chat.session_id)}
                />
              ))
            ) : (
              <p className="p-4 text-center text-xs text-gray-400">
                Tidak ada antrian.
              </p>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
