import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Store the token
      Cookies.set('token', token, { expires: 7 });

      // Fetch user data
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          setUser(data.user);
          navigate('/'); // Redirect to home after successful login
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          navigate('/login'); // Redirect back to login on error
        }
      };

      fetchUserData();
    } else {
      navigate('/login'); // No token found, redirect to login
    }
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Processing login...</h1>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
