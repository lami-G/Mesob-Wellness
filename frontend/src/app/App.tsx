/* ========================================
   APP ROOT COMPONENT (TYPESCRIPT)
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './providers';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider, ErrorBoundary } from '@/components/feedback';
import AppRouter from '../routes/AppRouter';
import '@/styles/index.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;
