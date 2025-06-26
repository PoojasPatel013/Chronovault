// frontend/src/components/Login.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const response = await fetch(`${API_BASE_URL}/api/auth/google/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Google login failed');
      }

      const data = await response.json();
      login(data.token, data.user);
      navigate('/');
    } catch (error) {
      setError('Google login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-gray-400">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email and password fields */}
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => console.log('Login Failed')}
            useOneTap
            render={(renderProps) => (
              <button
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                className="w-full flex justify-center py-3 px-4 border border-gray-700 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35,11.1H12.18V13.82H19.59C19.4,17.18 16.35,20.88 12,21.35c-3.6,0 -6.92,-2.22 -8.48,-5.35c-1.33,2.08 -3.6,3.35 -6.1,3.35c-4.42,0 -8,-3.58 -8,-8s3.58,-8 8,-8s8,3.58 8,8c0,1.33 -0.42,2.48 -1.24,3.42l8.55,8.54l1.41,-1.41L21.35,11.1z"/>
                </svg>
                Sign in with Google
              </button>
            )}
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;