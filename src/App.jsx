// src/App.jsx (DIPERBARUI)

import { Suspense, useEffect, useMemo } from "react";
import "./App.css";
import { createRouterForUser } from "./routes/routes";
import { RouterProvider } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { menu } from "./configs/menu";
import Pusher from "pusher-js";
import toast, { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";


// Komponen ini menangani routing dinamis berdasarkan hak akses pengguna.
const AppRouter = () => {
  const router = useMemo(() => {
    return createRouterForUser(menu); // Gunakan 'menu' asli, bukan 'accessibleMenu'
  }, []); // Dependency array kosong, router hanya dibuat sekali.

  return <RouterProvider router={router} />;
};

// Komponen baru untuk menampung logika yang butuh akses ke AuthContext
const AppContent = () => {
  const { authState, verifySession } = useAuth();
  const PusherKey = import.meta.env.VITE_PUSHER_KEY;
  const PusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;
  

  useEffect(() => {
    // HANYA jalankan Pusher jika pengguna sudah login (authType ada isinya)
    if (!authState.authType || !PusherKey) {
      return;
    }
    const pusher = new Pusher(PusherKey, { cluster: PusherCluster });
    const user = authState.user;
    // 1. Channel untuk notifikasi scrapping
    const scrappingChannel = pusher.subscribe("Scrapping-notification");
    let toastId;
    scrappingChannel.bind("status-event", function (data) {
      if (data.status === "running") {
        toastId = toast.loading(data.message);
      } else if (data.status === "done") {
        toast.success(data.message, { id: toastId, duration: 4000 });
      }
    });

    // 2. Channel BARU untuk update hak akses team
    const teamChannel = pusher.subscribe('team-updates');
    teamChannel.bind('access-changed', (data) => {
      // Jika team yang berubah adalah team pengguna saat ini,
      // panggil verifySession untuk memuat ulang profil dan hak akses terbaru.
      if (data.team_id === authState.user.id_team) { // Asumsi id_team ada di user object
        console.log("Hak akses Anda diubah. Memuat ulang sesi...");
        toast.success('Admin Memperbarui hak akses..');
        verifySession(); // Panggil fungsi dari context
      }
    });

    //3.team user diubah
    const userChannelName = `user-updates-${user.email}-${authState.authType}`;
    const userChannel = pusher.subscribe(userChannelName);

    userChannel.bind('team-changed', (data) => {
      console.log("Perubahan peran terdeteksi:", data.message);
      toast.success('Peran Anda diperbarui oleh admin, memuat ulang sesi...');
      // Panggil verifySession untuk memuat ulang profil dan hak akses terbaru
      verifySession();
    });

    // Cleanup saat komponen unmount atau saat pengguna logout
    return () => {
      pusher.unsubscribe("Scrapping-notification");
      pusher.unsubscribe("team-updates");
      pusher.disconnect();
    };
    // Efek ini akan berjalan lagi jika authType berubah (login/logout)
  }, [authState.authType, authState.user?.id_team, verifySession, PusherKey, PusherCluster, authState.user]);

  return <AppRouter />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          // Style default untuk semua toast
          style: {
            padding: "12px",
            fontSize: "0.9em", // Font lebih kecil
            backgroundColor: "rgba(255, 255, 255, 0.75)", // Background sedikit transparan
            backdropFilter: "blur(4px)", // Efek blur di belakang (opsional)
            border: "1px solid #E0E0E0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            color: "#333",
          },
          // Override style untuk tipe toast tertentu
          success: {
            style: {
              backgroundColor: "rgba(239, 253, 243, 0.75)", // Hijau transparan
              color: "#166534", // Warna teks hijau gelap
              border: "1px solid #A7F3D0",
            },
          },
          loading: {
            style: {
              backgroundColor: "rgba(239, 246, 255, 0.75)", // Biru transparan
              color: "#1E40AF", // Warna teks biru gelap
              border: "1px solid #BFDBFE",
            },
          },
        }}
      />
      <Suspense
        fallback={
          <div className="p-6 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        {/* Gunakan AppContent agar bisa mengakses useAuth */}
        <AppContent />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
