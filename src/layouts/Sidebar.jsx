// src/layouts/Sidebar.jsx

import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Clock, MessageSquare, History } from "lucide-react";
import { useAuth } from "../context/hooks/useAuth";
import { useAgentStore } from "./store/useAgentStore";
import { useAgentData } from "./hooks/useAgentData";
import { menu } from "../configs/menu";
import AgentSidebarSection from "./components/AgentSidebarSection";

const ChatListItem = ({ chat, isActive, onClick, type }) => (
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
          {new Date(chat.created_at || chat.claimed_at || chat.ended_at).toLocaleTimeString(
            "id-ID",
            { hour: "2-digit", minute: "2-digit" }
          )}
        </div>
      </div>
      <div className="text-xs text-gray-600 line-clamp-2">
        {type === 'active' ? "Percakapan sedang berlangsung..." :
         type === 'queue' ? "Menunggu di antrian..." :
         "Percakapan telah selesai."}
      </div>
    </div>
);


const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authState, isSuperAdmin } = useAuth();
  
  const { 
    queue, activeChat, history, initialize, claimChat, 
    managePresence, agentStatus, fetchHistoryTranscript 
  } = useAgentStore();
  
  const { queueCount, activeCount, historyCount, agentName } = useAgentData();

  const [activeList, setActiveList] = useState('queue');

  const showAgentSection = useMemo(() => {
    return authState.user?.permissions?.includes("agent-dashboard:access");
  }, [authState.user]);

  useEffect(() => {
    if (showAgentSection) {
        initialize();
        const cleanupPresence = managePresence(); 
        return () => {
            if (cleanupPresence) cleanupPresence();
        };
    }
  }, [showAgentSection, initialize, managePresence]);

  const handleQueueSelect = async (sessionId) => {
    const session = await claimChat(sessionId);
    if (session) {
        navigate(`/agent-dashboard/${session.id}`);
    }
  };

  const handleHistorySelect = (sessionId) => {
    fetchHistoryTranscript(sessionId);
    navigate('/agent-dashboard');
  };

  useEffect(() => {
    // Logika ini menentukan tab mana yang aktif secara default
    if (location.pathname.includes('/history')) {
        setActiveList('history');
    } else if (activeChat) {
        setActiveList('active');
    } else {
        setActiveList('queue');
    }
  }, [location.pathname, activeChat]);

  const accessibleMenu = useMemo(() => {
    const user = authState.user;
    const userAccessList = user?.access_list || [];
    const userPermissions = user?.permissions || [];
    const userIsSuperAdmin = isSuperAdmin(user);

    return menu.filter((item) => {
      if (userIsSuperAdmin) return true;
      if (item.identifier === "user-management") return userPermissions.includes("user-management:master");
      if (item.identifier === "role-management") return userPermissions.includes("role-management:master");
      if (item.identifier === "team-management") return false; 
      return userAccessList.includes(item.identifier);
    });
  }, [authState.user, isSuperAdmin]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

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
              <img src={item.icon} alt={`${item.title} Icon`} className="w-5 h-5 md:mr-3" />
            ) : (
              <item.icon className="w-5 h-5 md:mr-3" />
            )}
            <span className="hidden md:inline">{item.title}</span>
          </Link>
        ))}
      </div>

      {showAgentSection && (
        <div className="flex flex-col min-h-0">
          <AgentSidebarSection 
            activeList={activeList}
            setActiveList={setActiveList}
            counts={{ active: activeCount, queue: queueCount, history: historyCount }}
            agentName={agentName}
            agentStatus={agentStatus}
          />
          
          <div className="overflow-y-auto hidden md:block h-[170px]">
            {activeList === 'active' && (
              <>
                <div className="px-5 py-2 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-700 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" /> Sesi Aktif
                </div>
                {activeChat ? (
                    <ChatListItem chat={activeChat} isActive={true} onClick={() => navigate(`/agent-dashboard/${activeChat.id}`)} type="active" />
                ) : (
                    <p className="p-4 text-center text-xs text-gray-400">Tidak ada sesi aktif.</p>
                )}
              </>
            )}

            {activeList === 'queue' && (
              <>
                <div className="px-5 py-2 bg-gray-100 border-y border-gray-200 text-xs font-semibold text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Antrian Chat ({queue.length})
                </div>
                {queue.length > 0 ? (
                  queue.map((chat) => (
                    <ChatListItem key={chat.session_id} chat={chat} isActive={false} onClick={() => handleQueueSelect(chat.session_id)} type="queue" />
                  ))
                ) : (
                  <p className="p-4 text-center text-xs text-gray-400">Tidak ada antrian.</p>
                )}
              </>
            )}
            
            {activeList === 'history' && (
              <>
                <div className="px-5 py-2 bg-gray-100 border-y border-gray-200 text-xs font-semibold text-gray-700 flex items-center">
                  <History className="w-4 h-4 mr-2" /> Riwayat Chat ({history.length})
                </div>
                {history.length > 0 ? (
                    history.map((item) => (
                        <ChatListItem key={item.id} chat={item} isActive={false} onClick={() => handleHistorySelect(item.id)} type="history" />
                    ))
                ) : (
                    <p className="p-4 text-center text-xs text-gray-400">Tidak ada riwayat.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;