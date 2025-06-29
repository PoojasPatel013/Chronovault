// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

// Update the API configuration in AuthContext.jsx
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = Cookies.get('jwt');
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      // Verify token and fetch user data
      console.log('Verifying token and fetching user data');
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
    }
  }, []);

  const signup = async (userData) => {
    try {
      // Validate input
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Name, email, and password are required');
      }

      const response = await api.post('/auth/signup', {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password
      });

      const { token, user } = response.data;
      Cookies.set('jwt', token, { 
        expires: 7,
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(user);
      setError('');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      console.error('Signup error:', error);
      throw new Error(errorMessage);
    }
  };

  const login = async (email, password) => {
    try {
      // Ensure we're using the correct API path
      const response = await api.post('/api/auth/login', { 
        email: email.trim().toLowerCase(),
        password
      });
      
      const { token, user } = response.data;
      
      // Store token with proper security settings
      Cookies.set('jwt', token, { 
        expires: 7,
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
      });
      
      // Update axios instance with token
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      // Update user state
      setUser(user);
      setError('');
      
      // Return success
      return true;
    } catch (error) {
      // Handle error with proper logging
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      });
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const googleLogin = async (token) => {
    try {
      const response = await api.post('/auth/google/token', { token });
      const jwtToken = response.data.token;
      Cookies.set('jwt', jwtToken, { expires: 7 });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Google login failed';
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      Cookies.remove('jwt');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      Cookies.remove('jwt');
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    signup,
    login,
    googleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;