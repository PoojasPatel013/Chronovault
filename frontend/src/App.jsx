// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import TimeCapsule from './components/TimeCapsule';
import CommunityFeed from './components/CommunityFeed';
import PersonalityTest from './components/PersonalityTest';
import PersonalityResult from './components/PersonalityResult';
import AITherapy from './components/AITherapy';
import BookSession from './components/BookSession';
import UserDashboard from './components/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './components/Settings';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/time-capsule"
                element={
                  <ProtectedRoute>
                    <TimeCapsule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <CommunityFeed />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personality-test"
                element={
                  <ProtectedRoute>
                    <PersonalityTest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/personality-result"
                element={
                  <ProtectedRoute>
                    <PersonalityResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-therapy"
                element={
                  <ProtectedRoute>
                    <AITherapy />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-session"
                element={
                  <ProtectedRoute>
                    <BookSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;