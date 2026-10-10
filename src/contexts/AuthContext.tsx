import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: { id: string; email: string; user_metadata: { name: string } };
  session: null;
  loading: false;
  isConfigured: false;
  isDemoMode: true;
  setDemoMode: (val: boolean) => void;
  signOut: () => Promise<void>;
}

const automaticUser = {
  id: 'luana-automatic-access',
  email: 'luoliveiraguimaraes@outlook.com',
  user_metadata: { name: 'Luana' },
};

const AuthContext = createContext<AuthContextType>({
  user: automaticUser,
  session: null,
  loading: false,
  isConfigured: false,
  isDemoMode: true,
  setDemoMode: () => undefined,
  signOut: async () => undefined,
});

const automaticAuthValue: AuthContextType = {
  user: automaticUser,
  session: null,
  loading: false,
  isConfigured: false,
  isDemoMode: true,
  setDemoMode: () => undefined,
  signOut: async () => undefined,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthContext.Provider value={automaticAuthValue}>
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);

