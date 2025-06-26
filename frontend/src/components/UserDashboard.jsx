
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Calendar, Lock, CreditCard } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"


const UserDashboard = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [privacyOption, setPrivacyOption] = useState("public")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Simulate user profile data
        const mockProfile = {
          name: user?.username || "User",
          email: user?.email || "user@example.com",
          credits: 150,
          upcomingSessions: 2,
          completedSessions: 8,
          timeCapsules: 5,
          joinDate: "2024-01-15",
          lastLogin: new Date().toISOString(),
        }
        setUserProfile(mockProfile)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  const handlePrivacyChange = async (option) => {
    setPrivacyOption(option)
    try {
      const token = localStorage.getItem("token")
      await fetch("http://localhost:5000/api/user/privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ privacyOption: option }),
      })
    } catch (error) {
      console.error("Error updating privacy settings:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white text-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          Loading your dashboard...
        </motion.div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Failed to load profile data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          Welcome to Your Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <User className="mr-2" /> Profile Information
            </h2>
            <div className="space-y-3">
              <p>
                <strong>Name:</strong> {userProfile.name}
              </p>
              <p>
                <strong>Email:</strong> {userProfile.email}
              </p>
              <p>
                <strong>Member Since:</strong> {new Date(userProfile.joinDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Last Login:</strong> {new Date(userProfile.lastLogin).toLocaleDateString()}
              </p>
            </div>
          </motion.div>

          {/* Credits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <CreditCard className="mr-2" /> Chrono-Credits
            </h2>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-400 mb-2">{userProfile.credits}</p>
              <p className="text-gray-400 mb-4">Available Credits</p>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm transition-colors">
                Purchase More Credits
              </button>
            </div>
          </motion.div>

          {/* Session Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-2" /> Session Statistics
            </h2>
            <div className="space-y-3">
              <p>
                <strong>Upcoming Sessions:</strong> {userProfile.upcomingSessions}
              </p>
              <p>
                <strong>Completed Sessions:</strong> {userProfile.completedSessions}
              </p>
              <p>
                <strong>Time Capsules Created:</strong> {userProfile.timeCapsules}
              </p>
            </div>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800 p-6 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Lock className="mr-2" /> Privacy Settings
            </h2>
            <p className="text-gray-400 mb-4">
              Control how your profile and content appear to other users in the community.
            </p>
            <div className="flex flex-wrap gap-4">
              {["public", "private", "anonymous"].map((option) => (
                <button
                  key={option}
                  onClick={() => handlePrivacyChange(option)}
                  className={`px-6 py-3 rounded-full transition-colors ${
                    privacyOption === option ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{option.charAt(0).toUpperCase() + option.slice(1)}</div>
                    <div className="text-xs mt-1">
                      {option === "public" && "Visible to everyone"}
                      {option === "private" && "Only visible to you"}
                      {option === "anonymous" && "Hidden identity"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-lg transition-colors">
            Edit Profile
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full text-lg transition-colors">
            View My Time Capsules
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full text-lg transition-colors">
            Session History
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default UserDashboard
