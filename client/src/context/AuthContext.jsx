import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Sync on start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      syncUser(parsedUser.id);
    }
  }, []);

  // Helper function to fetch full user object including Portfolio
  const syncUser = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/user/${userId}`);
      
      // CRITICAL: We map backend fields to frontend fields AND keep the portfolio!
      const freshUser = { 
        ...res.data, 
        id: res.data._id, // Ensure ID format matches
        balance: res.data.walletBalance,
        portfolio: res.data.portfolio // <--- ADDED THIS TO SYNC SHARES
      };

      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (err) {
      console.error("User sync failed", err);
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    await syncUser(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};