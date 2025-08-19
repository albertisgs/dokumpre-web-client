import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from '../../../axios/axiosInstance';

export const useOAuthCallback = (provider,status) => {
  const navigate = useNavigate();
  const { updateAuth, logout } = useAuth();

  useEffect(() => {

    if (status !== 'login-success') {
      return; // Jangan lakukan apa-apa jika status tidak sukses
    }

    const verifyUser = async () => {
      try {
        const profile = await axiosInstance.generalSession.get("api/auth/me");
        
        if (profile.data) {
          updateAuth(
            {
              email: profile.data.email,
              name: profile.data.username,
              picture: profile.data.photo_url || null, // Handle jika picture tidak ada
              team: profile.data?.team_name,
              access_list: profile.data.access_list,
              id_team: profile.data.id_team
            },
            provider
          );
          navigate("/");
        } else {
          throw new Error("Profil tidak ditemukan");
        }
      } catch (error) {
        console.error("Verifikasi callback gagal:", error);
        logout()
        navigate("/login", { state: { error: "Autentikasi gagal" } });
      }
    };

    verifyUser();
  }, [provider, status, updateAuth, navigate]);
};