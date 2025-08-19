import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import axiosInstance from '../axios/axiosInstance';

// Mendefinisikan tipe data untuk metode autentikasi
type AuthType = 'credential' | 'google' | 'microsoft' | null;

// Mendefinisikan struktur data untuk pengguna
interface IUser {
  email: string;
  name?: string;
  picture?: string;
  team?: string;
  access_list?: string[];
  id_team?: string;
}

// Mendefinisikan struktur state autentikasi
type AuthState = {
  user: IUser | null;
  authType: AuthType;
};

// Mendefinisikan tipe untuk context
type AuthContextType = {
  authState: AuthState;
  updateAuth: (user: IUser, authType: AuthType) => void;
  logout: () => void;
  verifySession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const authType = localStorage.getItem('authType') as AuthType || null;
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

  // Fungsi updateAuth dibuat stabil dengan useCallback
  const updateAuth = useCallback((user: IUser, authType: AuthType) => {
    localStorage.setItem('authType', authType || '');
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({ user, authType });
  }, []);

  // Fungsi verifySession dibuat stabil dengan useCallback
  const verifySession = useCallback(async () => {
    const storedAuthType = localStorage.getItem('authType') as AuthType;
    if (!storedAuthType) {
      return; // Tidak ada sesi untuk diverifikasi
    }

    try {
      // 1. Ambil profil pengguna dari endpoint /me
      const profile = await axiosInstance.generalSession.get("api/auth/me");

      if (profile.data) {
          // 3. Gabungkan data untuk membuat objek pengguna yang lengkap
        const freshUser: IUser = {
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
    <AuthContext.Provider value={{ authState, updateAuth, logout, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};