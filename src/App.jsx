// src/App.jsx

import { Suspense, useEffect, useMemo } from "react";
import "./App.css";
import { createRouterForUser } from "./routes/routes";
import { RouterProvider } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { menu } from "./configs/menu";
import Pusher from "pusher-js";
import toast, { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/hooks/UseAuth";
import { useQueryClient } from "@tanstack/react-query";

// Komponen AppRouter tidak berubah
const AppRouter = () => {
  const router = useMemo(() => {
    return createRouterForUser(menu);
  }, []);
  return <RouterProvider router={router} />;
};

// Komponen AppContent diubah untuk menangani semua logika Pusher
const AppContent = () => {
  const { authState, verifySession } = useAuth();
  const queryClient = useQueryClient();
  const PusherKey = import.meta.env.VITE_PUSHER_KEY;
  const PusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;
  
  useEffect(() => {
    if (!authState.authType || !PusherKey || !authState.user) {
      return;
    }

    const pusher = new Pusher(PusherKey, { cluster: PusherCluster });
    const user = authState.user;
    
    // 1. Channel untuk notifikasi scrapping (Struktur Asli)
    const scrappingChannel = pusher.subscribe("Scrapping-notification");
    let toastId;
    scrappingChannel.bind("status-event", function (data) {
      if (data.status === "running") {
        toastId = toast.loading(data.message);
      } else if (data.status === "done") {
        toast.success(data.message, { id: toastId, duration: 4000 });
      }
    });

    // 2. Channel untuk update hak akses team (Struktur Asli)
    const teamUpdatesChannel = pusher.subscribe('team-updates');
    teamUpdatesChannel.bind('access-changed', (data) => {
      if (data.team_id === authState.user.id_team) {
        toast.success('Admin updated your team access rights. Refreshing session...');
        verifySession();
      }
    });

    // 3. Channel untuk perubahan team atau role pengguna (Struktur Asli)
    const userChannelName = `user-updates-${user.email}-${authState.authType}`;
    const userChannel = pusher.subscribe(userChannelName);
    userChannel.bind('team-changed', (data) => {
        toast.success('Your team assignment was updated by an admin. Refreshing session...');
        verifySession();
    });
    // --- LISTENER BARU UNTUK ROLE CHANGE ---
    userChannel.bind('role-changed', (data) => {
        toast.success(data.message || 'Your role has been updated. Refreshing session...');
        verifySession();
    });

    // --- LISTENER BARU UNTUK PERMISSION CHANGE DI DALAM TIM ---
    const teamPermissionsChannelName = `team-updates-${user.id_team}`;
    const teamPermissionsChannel = pusher.subscribe(teamPermissionsChannelName);
    teamPermissionsChannel.bind('permissions-changed', (data) => {
        console.log("Permissions changed for your team:", data.message);
        toast.success('Permissions for a role in your team have changed. Refreshing session...');
        verifySession();
    });

    // --- LISTENER BARU UNTUK PROMPT STATUS CHANGE ---
    const promptChannelName = `prompt-updates-${user.team?.replace(' ', '_')}`;
    const promptChannel = pusher.subscribe(promptChannelName);
    promptChannel.bind('status-changed', (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['syncPromptData'] });
    });


    // Cleanup semua channel saat komponen unmount
    return () => {
      pusher.unsubscribe("Scrapping-notification");
      pusher.unsubscribe("team-updates");
      pusher.unsubscribe(userChannelName);
      pusher.unsubscribe(teamPermissionsChannelName);
      pusher.unsubscribe(promptChannelName);
      pusher.disconnect();
    };
  }, [authState.authType, authState.user, verifySession, queryClient, PusherKey, PusherCluster]);

  return <AppRouter />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" />
      <Suspense fallback={
          <div className="p-6 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }>
        <AppContent />
      </Suspense>
    </AuthProvider>
  );
}

export default App;