import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check for token in URL (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem('authToken', tokenFromUrl);
      window.history.replaceState({}, document.title, "/dashboard");
      setIsAuthenticated(true);
      setView('dashboard');
      return;
    }

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

  return <LandingPage onNavigateToLogin={() => navigateTo('login')} />;
}
