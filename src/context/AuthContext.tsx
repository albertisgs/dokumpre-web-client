// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axiosInstance from '../axios/axiosInstance';

type AuthType = 'credential' | 'google' | 'microsoft' | null;

interface IUser {
  email: string;
  password?: string;
  googleId?: string;
  picture?: string;
  name?: string;
  role?: string;
}

type AuthState = {
  user: IUser;
  authType: AuthType;
};

type AuthContextType = {
  authState: AuthState;
  updateAuth: (user: IUser, authType: AuthType) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state from localStorage. This is the single source of truth.
  const [authState, setAuthState] = useState<AuthState>(() => {
    const authType = localStorage.getItem('authType') as AuthType || null;
    // Ensure that if localStorage is empty, it returns a valid initial object.
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { email: '' };
    
    return {
      user,
      authType
    };
  });

   useEffect(() => {
    verifySession();
  }, []);

  const verifySession = async () => {
    // Get the stored auth type to check if a session should exist.
    const storedAuthType = localStorage.getItem('authType') as AuthType;
    if (!storedAuthType) {
      return; // No session to verify, so we exit early.
    }

    try {
      // 1. Fetch the user's profile from the '/me' endpoint.
      const profile = await axiosInstance.generalSession.get("api/auth/me");

      if (profile.data) {
        let userRole = 'Default'; // Provide a default role

        // 2. If a role ID is present, fetch the specific role name.
        if (profile.data.id_role) {
          const role = await axiosInstance.generalSession.get(
            `api/user-management/roles/${profile.data.id_role}`
          );
          if(role.data?.name) {
            userRole = role.data.name;
          }
        }

        // 3. We have fresh data; update the context and localStorage.
        const freshUser: IUser = {
          email: profile.data.email,
          name: profile.data.username,
          // Use picture from profile if it exists, otherwise it will be undefined
          picture: profile.data.photo_url, 
          role: userRole,
        };
        
        // Use the authType that's already stored, don't hardcode it.
        updateAuth(freshUser, storedAuthType);
        
      } else {
        // If the API returns success but no data, treat it as an error.
        throw new Error("Profile data is empty, session invalid.");
      }

    } catch (error) {
      // If any API call fails (e.g., returns 401), the session is invalid.
      // Clear all stale authentication data from the client.
      console.error("Session verification failed, clearing local auth state:", error);
      logout()
      localStorage.removeItem('authType');
      localStorage.removeItem('user');
      setAuthState({
        user: { email: '' },
        authType: null,
      });
    }
  };

  const updateAuth = (user: IUser, authType: AuthType) => {
    localStorage.setItem('authType', authType || '');
    localStorage.setItem('user', JSON.stringify(user));
    
    setAuthState({ 
      user, 
      authType 
    });
  };

  const logout = () => {
      // Always clear local data regardless of server response.
      localStorage.removeItem('authType');
      localStorage.removeItem('user');
      setAuthState({
        user: { email: '' },
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