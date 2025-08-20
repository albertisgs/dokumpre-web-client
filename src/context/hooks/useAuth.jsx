// src/hooks/useAuth.js (New File)

import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
// Sesuaikan path jika perlu

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
