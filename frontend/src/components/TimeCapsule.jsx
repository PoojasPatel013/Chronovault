"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { FaLock, FaUnlock, FaFile, FaCalendar, FaEye, FaEyeSlash } from "react-icons/fa"

const TimeCapsule = () => {
  const [memory, setMemory] = useState("")
  const [file, setFile] = useState(null)
  const [unlockDate, setUnlockDate] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [filePreview, setFilePreview] = useState("")
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const token = localStorage.getItem("token")
      
      // Validate form
      if (!memory.trim()) {
        throw new Error("Memory content is required")
      }
      if (!unlockDate) {
        throw new Error("Unlock date is required")
      }
      if (file && !file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) {
        throw new Error("Only images and PDF files are allowed")
      }

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

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create time capsule")
      }

      setSuccess(true)
      setMemory("")
      setFile(null)
      setFilePreview("")
      setUnlockDate("")
      setIsPublic(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setFilePreview(e.target.result)
        reader.readAsDataURL(selectedFile)
      } else {
        setFilePreview('')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-lg"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Create a Time Capsule</h2>
          <p className="text-gray-400 text-sm">
            Preserve your memories for the future, {user?.username}
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <FaLock className="text-gray-400" />
                  Your Memory
                </span>
              </label>
              <textarea
                id="memory"
                name="memory"
                required
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400 resize-none"
                placeholder="Write your memory here..."
                rows={4}
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
              />
            </div>

            {filePreview && (
              <div className="relative rounded-lg overflow-hidden mb-4">
                {file.type.startsWith('image/') ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-700 text-white">
                    <FaFile className="text-4xl mr-2" />
                    <div>
                      <p className="font-medium">PDF Document</p>
                      <p className="text-sm text-gray-400">{file.name}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setFile(null)
                    setFilePreview("")
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-sm hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <FaFile className="text-gray-400" />
                  Upload Photo/Document (Optional)
                </span>
              </label>
              <div className="relative">
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*,application/pdf"
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: JPG, PNG, PDF
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <FaCalendar className="text-gray-400" />
                  Unlock Date
                </span>
              </label>
              <input
                id="unlockDate"
                name="unlockDate"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Select a future date when this capsule will be unlocked
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  className="w-5 h-5 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-300">
                  Make this time capsule public
                </label>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-300">
                  {isPublic ? <FaEye /> : <FaEyeSlash />} Visible after unlock date
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FaLock className="mr-2" />
                  Create Time Capsule
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-600/10 border border-red-600 text-red-400 rounded-lg p-3 text-sm"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-600/10 border border-green-600 text-green-400 rounded-lg p-3 text-sm"
          >
            Time capsule created successfully!
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default TimeCapsule
