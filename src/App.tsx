import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { MainLayout } from './components/layout/MainLayout';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <MainLayout />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
