import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import Login from "./features/auth/Login";
import Dashboard from "./features/dashboard/Dashboard";
import LandingPage from "./components/LandingPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login onBack={() => window.history.back()} />} />
            <Route
              path="/dashboard"
              element={(
                <PrivateRoute>
                  <Dashboard onLogout={() => window.location.href = "/"} />
                </PrivateRoute>
              )}
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      setView('dashboard');
    }
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setView('landing');
  };

  const navigateTo = (path: 'landing' | 'login' | 'dashboard') => {
    setView(path);
  };

  if (view === 'dashboard' && isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (view === 'login') {
    return <Login onLogin={handleLogin} onBack={() => navigateTo('landing')} />;
  }

  return <LandingPage onLogin={() => navigateTo('login')} />;
}
