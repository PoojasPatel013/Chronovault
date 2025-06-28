// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <div className="bg-secondary p-8 rounded-lg shadow-lg w-full max-w-md relative">
        <h2 className="text-3xl font-bold text-center mb-8 text-accent">
          Welcome Back
        </h2>
        
        {error && (
          <div className="bg-red-600 text-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2 px-4 rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-secondary text-gray-400">Or continue with</span>
            </div>
          </div>
        </div>

        <a href={`${import.meta.env.VITE_API_URL}/auth/google`} 
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Sign in with Google
        </a>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-accent hover:text-accent/90"
          >
            Register here
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;