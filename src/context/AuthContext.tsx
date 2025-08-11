// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthType = 'credential' | 'google' | 'microsoft' | null;

interface IUser {
  email: string;
  password?: string;
  googleId?: string;
  picture?: string;
  name?: string;
  role?:string
}

type AuthState = {
  user: IUser;
  token: string; // This is typically the access_token
  id_token?: string; // Optional ID token
  authType: AuthType;
};

type AuthContextType = {
  authState: AuthState;
  updateAuth: (user: IUser, token: string, authType: AuthType, id_token?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state from localStorage if available
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token') || '';
    const id_token = localStorage.getItem('id_token') || undefined;
    const authType = localStorage.getItem('authType') as AuthType || null;
    const user = JSON.parse(localStorage.getItem('user') || '{"email": ""}');
    
    return {
      user,
      token,
      id_token,
      authType
    };
  });

  const updateAuth = (user: IUser, token: string, authType: AuthType, id_token?: string) => {
    localStorage.setItem('token', token);
    if (id_token) {
      localStorage.setItem('id_token', id_token);
    }
    localStorage.setItem('authType', authType || '');
    localStorage.setItem('user', JSON.stringify(user));
    
    setAuthState({ 
      user, 
      token, 
      id_token,
      authType 
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('authType');
    localStorage.removeItem('user');
    setAuthState({
      user: { email: '' },
      token: '',
      id_token: undefined,
      authType: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, updateAuth, logout }}>
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