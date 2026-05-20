import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
    }
    return res.data;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    if (res.data.success) {
      setUser(res.data);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const bypassLoginAsStudent = () => {
    const mockStudent = { _id: '65f8a2e4b8a1c92d5e3f4a01', name: 'Demo Student', email: 'student@demo.com', role: 'student', token: 'dummy_student_token' };
    setUser(mockStudent);
    localStorage.setItem('userInfo', JSON.stringify(mockStudent));
  };

  const bypassLoginAsMentor = () => {
    const mockMentor = { _id: '65f8a2e4b8a1c92d5e3f4a02', name: 'Demo Mentor', email: 'mentor@demo.com', role: 'mentor', token: 'dummy_mentor_token' };
    setUser(mockMentor);
    localStorage.setItem('userInfo', JSON.stringify(mockMentor));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, bypassLoginAsStudent, bypassLoginAsMentor }}>
      {children}
    </AuthContext.Provider>
  );
};
