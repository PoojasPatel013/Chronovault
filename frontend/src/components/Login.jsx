// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuth().login;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const user = await login({ email: email.trim().toLowerCase(), password });
  
      if (user) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true }); // ⬅️ now only navigate if user is valid
      } else {
        setError('Login failed');
      }
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-gray-800/80 backdrop-blur-md border border-gray-700">
        <h1 className="text-2xl font-bold text-white">Login</h1>
        {error && <div className="bg-red-500/20 p-2 rounded text-red-400">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
