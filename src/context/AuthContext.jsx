import React, { createContext,useState, ReactNode, useEffect, useCallback } from 'react';
import axiosInstance from '../axios/axiosInstance';


const AuthContext = createContext(undefined);

const SUPERADMIN_TEAM_ID = import.meta.env.VITE_SUPERADMIN_ID;

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const authType = localStorage.getItem('authType')|| null;
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    return { user, authType };
  });

  // Fungsi logout dibuat stabil dengan useCallback
  const logout = useCallback(() => {
    localStorage.removeItem('authType');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      authType: null,
    });
  }, []);

   const isSuperAdmin = useCallback((user) => {
    return user?.id_team === SUPERADMIN_TEAM_ID;
  }, []);

  // Fungsi updateAuth dibuat stabil dengan useCallback
  const updateAuth = useCallback((user, authType) => {
    localStorage.setItem('authType', authType || '');
    localStorage.setItem('user', JSON.stringify(user));
    isSuperAdmin(user)
    setAuthState({ user, authType });
  }, [isSuperAdmin]);

  // Fungsi verifySession dibuat stabil dengan useCallback
  const verifySession = useCallback(async () => {
    const storedAuthType = localStorage.getItem('authType');
    if (!storedAuthType) {
      return; // Tidak ada sesi untuk diverifikasi
    }

    try {
      // 1. Ambil profil pengguna dari endpoint /me
      const profile = await axiosInstance.generalSession.get("api/auth/me");

      if (profile.data) {
          // 3. Gabungkan data untuk membuat objek pengguna yang lengkap
        const freshUser = {
          email: profile.data.email,
          name: profile.data.username,
          picture: profile.data.photo_url,
          access_list: profile.data.access_list,
          team: profile.data?.team_name,
          id_team: profile.data.id_team,
        };
        
        // 4. Perbarui state dan localStorage
        updateAuth(freshUser, storedAuthType);
        
        
      } else {
        throw new Error("Data profil tidak lengkap, sesi tidak valid.");
      }

    } catch (error) {
      console.error("Verifikasi sesi gagal, membersihkan state lokal:", error);
      logout();
      window.location.href = '/login';
    }
  }, [logout, updateAuth]);

  // Efek ini hanya berjalan sekali saat aplikasi dimuat
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  

  return (
    <AuthContext.Provider value={{ authState, updateAuth, logout, verifySession, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export{ AuthContext } 