// src/layouts/components/AgentSidebarSection.jsx

import React from 'react';
import { useNavigate } from "react-router-dom";

const AgentSidebarSection = ({
  activeList,
  setActiveList,
  counts,
  agentName,
  agentStatus,
}) => {
  const navigate = useNavigate();

  const agentInitial = agentName
    ? agentName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "A";

  const statusConfig = {
    online: { text: "Online", color: "bg-green-500" },
    away: { text: "Away", color: "bg-yellow-500" },
    offline: { text: "Offline", color: "bg-red-500" },
  };

  const activeTabStyle = "bg-white border-gray-200 shadow-sm";
  const inactiveTabStyle = "bg-transparent border-transparent";

  // Cek apakah path saat ini adalah untuk riwayat
  const isHistoryActive = window.location.pathname.startsWith('/agent-dashboard/history');

  return (
    <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 hidden md:block">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
          {agentInitial}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-700">{agentName}</div>
          <div
            className={`text-xs font-semibold ${
              agentStatus === "online"
                ? "text-green-600"
                : agentStatus === "away"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {statusConfig[agentStatus]?.text || "Unknown"}
          </div>
        </div>
        <div
          className={`w-2 h-2 rounded-full ${
            statusConfig[agentStatus]?.color || "bg-gray-400"
          }`}
        ></div>
      </div>

      {/* Tabs Section */}
      <div className="flex justify-between text-center bg-gray-200 rounded-lg p-1">
        <button
          onClick={() => setActiveList("active")}
          className={`flex-1 rounded-md py-1 text-xs transition-all duration-200 ${
            activeList === "active" && !isHistoryActive ? activeTabStyle : inactiveTabStyle
          }`}
        >
          <span className="block font-bold text-lg text-gray-800">
            {counts.active}
          </span>
          <span className="text-gray-600">Aktif</span>
        </button>
        <button
          onClick={() => setActiveList("queue")}
          className={`flex-1 rounded-md py-1 text-xs transition-all duration-200 ${
            activeList === "queue" && !isHistoryActive ? activeTabStyle : inactiveTabStyle
          }`}
        >
          <span className="block font-bold text-lg text-gray-800">
            {counts.queue}
          </span>
          <span className="text-gray-600">Antrian</span>
        </button>
        <button
          onClick={() => setActiveList("history")}
          className={`flex-1 rounded-md py-1 text-xs transition-all duration-200 ${
            activeList === "history" || isHistoryActive ? activeTabStyle : inactiveTabStyle
          }`}
        >
          <span className="block font-bold text-lg text-gray-800">
            {counts.history}
          </span>
          <span className="text-gray-600">Riwayat</span>
        </button>
      </div>
    </div>
  );
};

export default AgentSidebarSection;