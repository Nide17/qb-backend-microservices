import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'styled-components';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { store, persistor } from './app/store';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import ErrorFallback from './components/ErrorFallback';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load route components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const QuizPage = React.lazy(() => import('./pages/quiz/QuizPage'));
const QuizResultsPage = React.lazy(() => import('./pages/quiz/QuizResultsPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = React.lazy(() => import('./pages/user/ProfilePage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = false; // Replace with actual auth check
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <HelmetProvider>
              <GlobalStyles />
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Router>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      
                      {/* Protected Routes */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/quiz/:id"
                        element={
                          <ProtectedRoute>
                            <QuizPage />
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/quiz/:id/results"
                        element={
                          <ProtectedRoute>
                            <QuizResultsPage />
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Router>
                </Suspense>
                
                {/* Toast Notifications */}
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </ErrorBoundary>
              
              {/* React Query DevTools - Only in development */}
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </HelmetProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
