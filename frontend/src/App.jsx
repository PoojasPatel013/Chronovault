import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Header from "./components/Header"
import Home from "./components/Home"
import Login from "./components/Login"
import SignUp from "./components/SignUp"
import TimeCapsule from "./components/TimeCapsule"
import CommunityFeed from "./components/CommunityFeed"
import PersonalityTest from "./components/PersonalityTest"
import AITherapy from "./components/AITherapy"
import BookSession from "./components/BookSession"
import UserDashboard from "./components/UserDashboard"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

