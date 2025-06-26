import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion"


const AITherapy = () => {
  const [message, setMessage] = useState("")
  const [conversation, setConversation] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:5000/api/therapy/ai-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      const data = await res.json()
      setConversation([...conversation, { role: "user", content: message }, { role: "ai", content: data.message }])
      setMessage("")
    } catch (err) {
      setError("Failed to get AI response. Please try again.")
      console.error("Error fetching AI response:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-center text-3xl font-extrabold text-white mb-8">AI Therapy Session</h2>
          <div className="bg-gray-800 shadow-xl rounded-lg p-6">
            <div className="h-96 overflow-y-auto mb-4 space-y-4">
              <AnimatePresence>
                {conversation.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 rounded-lg ${
                      msg.role === "user" ? "bg-blue-600 ml-auto" : "bg-gray-700"
                    } max-w-[80%] ${msg.role === "user" ? "text-right" : "text-left"}`}
                  >
                    <p className="text-white">{msg.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-grow p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </form>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AITherapy

