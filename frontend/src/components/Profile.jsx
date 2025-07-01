import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { Settings, Lock, Unlock, Globe, Edit2, User, Mail, Calendar, GenderMale, GenderFemale, GenderIntersex } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    birthdate: '',
    privacy: 'private'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        gender: data.user.gender,
        birthdate: new Date(data.user.birthdate).toISOString().split('T')[0],
        privacy: data.user.privacy || 'private'
      });
    } catch (error) {
      console.error('Profile error:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user.name,
      email: user.email,
      gender: user.gender,
      birthdate: new Date(user.birthdate).toISOString().split('T')[0],
      privacy: user.privacy || 'private'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUser(data.user);
      setEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update profile');
    }
  };

  const handlePrivacyChange = (e) => {
    setFormData({ ...formData, privacy: e.target.value });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Profile not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
          >
            <Edit2 size={20} />
            <span>Edit Profile</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 p-2 rounded text-red-400 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full rounded-md border-gray-300 bg-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500 ${
                  editing ? '' : 'cursor-not-allowed opacity-50'
                }`}
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full rounded-md border-gray-300 bg-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500 ${
                  editing ? '' : 'cursor-not-allowed opacity-50'
                }`}
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className={`w-full rounded-md border-gray-300 bg-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500 ${
                  editing ? '' : 'cursor-not-allowed opacity-50'
                }`}
                disabled={!editing}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Birthdate</label>
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                className={`w-full rounded-md border-gray-300 bg-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500 ${
                  editing ? '' : 'cursor-not-allowed opacity-50'
                }`}
                disabled={!editing}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Privacy Settings</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="private"
                    name="privacy"
                    value="private"
                    checked={formData.privacy === 'private'}
                    onChange={handlePrivacyChange}
                    className={`w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 ${
                      editing ? '' : 'cursor-not-allowed opacity-50'
                    }`}
                    disabled={!editing}
                  />
                  <label htmlFor="private" className="ml-2 text-sm font-medium text-gray-300">
                    <Lock size={16} className="inline-block mr-1" />
                    Private
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="public"
                    name="privacy"
                    value="public"
                    checked={formData.privacy === 'public'}
                    onChange={handlePrivacyChange}
                    className={`w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 ${
                      editing ? '' : 'cursor-not-allowed opacity-50'
                    }`}
                    disabled={!editing}
                  />
                  <label htmlFor="public" className="ml-2 text-sm font-medium text-gray-300">
                    <Globe size={16} className="inline-block mr-1" />
                    Public
                  </label>
                </div>
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>

        <div className="mt-8 border-t border-gray-700 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Account Settings</h2>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
            >
              <Settings size={20} />
              <span>Open Settings</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300"
          >
            <User size={20} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
