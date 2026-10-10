import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: { id: string; email: string; user_metadata: { name: string } };
  session: null;
  loading: false;
  isConfigured: boolean;
  isDemoMode: false;
  setDemoMode: (val: boolean) => void;
  signOut: () => Promise<void>;
}

// Usuária única e direta do aplicativo: apenas Luana
const automaticUser = {
  id: 'luana',
  email: 'luana@docesdaluana.com.br',
  user_metadata: { name: 'Luana' },
};

const automaticAuthValue: AuthContextType = {
  user: automaticUser,
  session: null,
  loading: false,
  isConfigured: true,
  isDemoMode: false,
  setDemoMode: () => undefined,
  signOut: async () => undefined,
};

const AuthContext = createContext<AuthContextType>(automaticAuthValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthContext.Provider value={automaticAuthValue}>
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);
