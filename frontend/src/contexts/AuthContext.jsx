// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Update the API configuration in AuthContext.jsx
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token refresh interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await api.post('/auth/refresh');
        const token = response.data.token;
        Cookies.set('jwt', token, { expires: 7 });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear the token and redirect to login
        Cookies.remove('jwt');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check authentication state
  const isAuthenticated = () => {
    const token = Cookies.get('jwt');
    return !!token && !!user && !!user._id;
  };

  // Authentication functions
  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: userData } = response.data;
      
      // Store token in cookie
      Cookies.set('jwt', token, { 
        expires: 7,
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      
      // Update user state
      setUser(userData);
      setError('');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.message || error.message || 'Signup failed');
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user: userData } = response.data;
      
      // Store token in cookie
      Cookies.set('jwt', token, { 
        expires: 7,
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      
      // Update user state
      setUser(userData);
      setError('');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'Login failed');
      return false;
    }
  };

  const googleLogin = async (token) => {
    try {
      const res = await api.post('/auth/google', { token });
      if (res.data.token) {
        Cookies.set('jwt', res.data.token, { 
          expires: 7,
          secure: window.location.protocol === 'https:',
          sameSite: 'lax'
        });
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google login failed:', error);
      setError(error.response?.data?.message || 'Google login failed');
      return false;
    }
  };

  const logout = () => {
    // Clear cookie
    Cookies.remove('jwt');
    // Clear user state
    setUser(null);
    setError('');
    // Clear axios default headers
    delete api.defaults.headers.Authorization;
    return true;
  };

  // Initialize auth state
  useEffect(() => {
    const token = Cookies.get('jwt');
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      // Verify token and fetch user data
      api.get('/auth/me')
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error('Token verification failed:', error);
          Cookies.remove('jwt');
          setError('Session expired. Please login again.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setUser(null);
      setError('');
      delete api.defaults.headers.Authorization;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signup,
        login,
        googleLogin,
        logout,
        loading,
        error,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;


