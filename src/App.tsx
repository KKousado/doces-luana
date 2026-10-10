import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { MainLayout } from './components/layout/MainLayout';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user) setShowWelcome(true);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      <FinanceProvider>
        <MainLayout />
      </FinanceProvider>

      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-[#1C1C1E]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-2xl dark:bg-pink-950/50">&#127856;</div>
            <h2 id="welcome-title" className="text-xl font-bold text-neutral-900 dark:text-white">Bem-vinda, Luana</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">Seu painel de gestão está pronto para você.</p>
            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              className="mt-6 w-full rounded-2xl bg-pink-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-500"
            >
              Começar agora
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
