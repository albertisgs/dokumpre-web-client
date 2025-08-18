// src/components/GoogleCallback.jsx

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useOAuthCallback } from "./hooks/UseOauthCallback"; // Sesuaikan path jika perlu

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Dapatkan status dari URL
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status");

  // State untuk menampilkan pesan dinamis ke pengguna
  const [statusMessage, setStatusMessage] = useState(
    "Verifying your Google Account..."
  );

  // 2. Panggil hook di top level dengan provider 'google' dan status saat ini
  useOAuthCallback("google", status);

  // 3. Gunakan useEffect hanya untuk menangani kasus gagal atau status tidak valid
  useEffect(() => {
    if (status === "unauthorized") {
      setStatusMessage("Your Google account is not authorized for this application.");
      setTimeout(() => navigate("/login"), 3000);
    } else if (status === "login-failed") {
      setStatusMessage("Login failed. Please try again.");
      setTimeout(() => navigate("/login"), 3000);
    } else if (status !== "login-success") {
       // Menangani kasus di mana status tidak ada atau tidak dikenali
      setStatusMessage("An unknown error occurred.");
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [status, navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mb-8">
        <img
          src="/Dokuprime.svg"
          alt="Dokuprime Logo"
          className="h-8 md:h-10"
        />
      </div>

      <div className="flex flex-col items-center space-y-4 text-center">
        <img
          src="/icons8-google-48.png"
          alt="Google icon"
          className="h-12 w-12 mb-4"
        />
        <p className="text-lg text-gray-600 px-4">{statusMessage}</p>
        
        {/* Tampilkan loader hanya jika statusnya adalah 'login-success' atau masih memverifikasi */}
        {status === "login-success" && (
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;