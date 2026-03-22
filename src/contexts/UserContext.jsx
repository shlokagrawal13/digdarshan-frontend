import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // User data will already have profileImageUrl from toJSON method
          setUser(response.data);
        } catch (err) {
          console.error('Auth init error:', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/complete-profile`,
        profileData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log("Profile update response:", response.data); // Debug log

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Store full user data including profileImageUrl
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout, updateProfile, login }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
