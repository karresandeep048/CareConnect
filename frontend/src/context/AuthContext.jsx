import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem('careconnect_user') || 'null');
  });
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'provider') {
      fetchProviderProfile();
    }
  }, [user]);

  const fetchProviderProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      if (res.data && res.data.providerProfile) {
        setProviderProfile(res.data.providerProfile);
      }
    } catch (err) {
      console.error('Failed to fetch provider profile:', err);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      setUser(res.data);
      localStorage.setItem('careconnect_user', JSON.stringify(res.data));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', userData);
      setUser(res.data);
      localStorage.setItem('careconnect_user', JSON.stringify(res.data));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };


  const logout = () => {
    setUser(null);
    setProviderProfile(null);
    localStorage.removeItem('careconnect_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      providerProfile,
      loading,
      login,
      register,
      logout,
      fetchProviderProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
