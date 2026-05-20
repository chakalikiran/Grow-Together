import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Sprints from './pages/Assignments';
import SprintDetail from './pages/SprintDetail';

import MainLayout from './components/MainLayout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bone">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gold/20 border-t-terracotta rounded-full animate-spin shadow-warm-sm"></div>
          <p className="text-slate/70 font-bold animate-pulse">Initializing Hub...</p>
        </div>
      </div>
    );
  }
  
  return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/" />;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-bone flex flex-col font-sans">
          <main className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
              <Route path="/assignments" element={<PrivateRoute><Sprints /></PrivateRoute>} />
              <Route path="/assignments/:id" element={<PrivateRoute><SprintDetail /></PrivateRoute>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
