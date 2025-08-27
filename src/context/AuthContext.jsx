// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../axios/axiosInstance';

const AuthContext = createContext(undefined);

const SUPERADMIN_TEAM_ID = import.meta.env.VITE_SUPERADMIN_ID;

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ user: null, authType: null });

  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('authType');
    localStorage.removeItem('user');
    setAuthState({ user: null, authType: null });
  }, []);

  const isSuperAdmin = useCallback((user) => {
    return user?.id_team === SUPERADMIN_TEAM_ID;
  }, []);

  const updateAuth = useCallback((user) => {
    localStorage.setItem('authType', user.account_type || '');
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({ user, authType: user.account_type });
  }, []);

  const verifySession = useCallback(async () => {
    // const storedAuthType = localStorage.getItem('authType');
    // if (!storedAuthType) {
    //     setIsInitializing(false); // Selesaikan inisialisasi
        
    //     return;
    // }


    try {
      const profile = await axiosInstance.generalSession.get("api/auth/me");
      if (profile.data) {
          const freshUser = {
            email: profile.data.email,
            name: profile.data.username,
            picture: profile.data.photo_url,
            access_list: profile.data.access_list,
            team: profile.data?.team_name,
            id_team: profile.data.id_team,
            id_role: profile.data.id_role,
            permissions: profile.data.permissions || [],
            account_type: profile.data.account_type,
          };
        // Panggil updateAuth versi baru yang mengambil authType dari data user
        updateAuth(freshUser);
      } else {
        throw new Error("Sesi tidak valid.");
      }
    } catch (error) {
      console.error("Verifikasi sesi gagal:", error);
      logout(); // Bersihkan state jika verifikasi gagal
    } finally {
      setIsInitializing(false);
    }
  }, [logout, updateAuth]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  return (
    // --- TAMBAHKAN isInitializing KE VALUE ---
    <AuthContext.Provider value={{ authState, updateAuth, logout, verifySession, isSuperAdmin, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };