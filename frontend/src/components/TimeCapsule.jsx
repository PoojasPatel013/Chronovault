"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"

const TimeCapsule = () => {
  const [memory, setMemory] = useState("")
  const [file, setFile] = useState(null)
  const [unlockDate, setUnlockDate] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("content", memory)
      formData.append("unlockDate", unlockDate)
      formData.append("isPublic", isPublic)
      if (file) {
        formData.append("file", file)
      }

      const response = await fetch("http://localhost:5000/api/timecapsules", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setSuccess(true)
        setMemory("")
        setFile(null)
        setUnlockDate("")
        setIsPublic(false)
      } else {
        throw new Error("Failed to create time capsule")
      }
    } catch (err) {
      setError("Failed to create time capsule. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Create a Time Capsule</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Preserve your memories for the future, {user?.username}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="memory" className="block text-sm font-medium text-gray-300 mb-2">
                Your Memory
              </label>
              <textarea
                id="memory"
                name="memory"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Write your memory here..."
                rows={4}
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-2">
                Upload Photo/Document (Optional)
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept="image/*,application/pdf,.doc,.docx"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <div>
              <label htmlFor="unlockDate" className="block text-sm font-medium text-gray-300 mb-2">
                Unlock Date
              </label>
              <input
                id="unlockDate"
                name="unlockDate"
                type="date"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <input
                id="isPublic"
                name="isPublic"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-300">
                Make this time capsule public (others can see it after unlock date)
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Create Time Capsule"
              )}
            </button>
          </div>
        </form>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center text-sm text-red-600">
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-center text-sm text-green-600"
          >
            Time capsule created successfully!
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}

export default TimeCapsule
