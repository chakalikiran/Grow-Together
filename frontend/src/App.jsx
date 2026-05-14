import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Assignments from './pages/Assignments';
import Doubts from './pages/Doubts';
import LiveClass from './pages/LiveClass';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing Session...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Navigation bar can go here */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
            <Route path="/assignments" element={<PrivateRoute><Assignments /></PrivateRoute>} />
            <Route path="/doubts" element={<PrivateRoute><Doubts /></PrivateRoute>} />
            <Route path="/meeting/:roomId" element={<PrivateRoute><LiveClass /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
