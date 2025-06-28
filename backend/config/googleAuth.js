// backend/config/googleAuth.js
import User from '../models/User.js';

export const getGoogleAuthUrl = async () => {
  try {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: 'http://localhost:8000/api/auth/google/callback',
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  } catch (error) {
    console.error('Failed to get Google auth URL:', error);
    throw new Error('Failed to get Google auth URL');
  }
};

export const getUserInfo = async (code) => {
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:8000/api/auth/google/callback',
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();
    return {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    };
  } catch (error) {
    console.error('Failed to get user info:', error);
    throw new Error('Failed to get user info');
  }
};

export const verifyToken = async (idToken) => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + idToken);
    if (!response.ok) {
      throw new Error('Failed to verify token');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to verify token:', error);
    throw new Error('Failed to verify token');
  }
};

