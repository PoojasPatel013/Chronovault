import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import { AI_CONFIG } from '../config/aiConfig';

const AITherapy = () => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Please Log In</h2>
          <p className="text-gray-400">You need to be logged in to use AI therapy</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Check authentication and user data
      if (!isAuthenticated || !user || !user._id) {
        setError("Please log in to use AI therapy");
        return;
      }

      console.log('Sending message to AI:', message);
      
      // Set up request options
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ 
          message,
          userId: user._id,
          model: AI_CONFIG.MODEL,
          maxTokens: AI_CONFIG.MAX_TOKENS,
          temperature: AI_CONFIG.TEMPERATURE
        }),
        timeout: AI_CONFIG.TIMEOUT
      };

      console.log('Request Configuration:', {
        path: AI_CONFIG.API_PATH,
        options,
        debug: AI_CONFIG.DEBUG_MODE
      });

      const startTime = performance.now();

      const res = await fetch(AI_CONFIG.API_PATH, options);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      
      console.log('AI Response Details:', {
        timestamp: new Date().toISOString(),
        responseLength: data.message?.length,
        debugInfo: data.debug,
        conversationLength: conversation.length + 2,
        responseTime: performance.now() - startTime
      });

      if (data.error) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      // Add debug information to conversation for development
      const newMessages = [
        { role: "user", content: message },
        { 
          role: "ai", 
          content: data.message,
          debug: data.debug,
          timestamp: new Date().toISOString()
        }
      ];

      setConversation(prev => [...prev, ...newMessages]);
      setMessage("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Error: ${errorMessage}`);
      console.error("Error fetching AI response:", {
        error: err,
        message: errorMessage,
        status: err?.status,
        stack: err?.stack
      });
    } finally {
      setLoading(false);
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
                      msg.role === "user" ? "bg-primary/90 dark:bg-primary/90 ml-auto" : "bg-background/80 dark:bg-background-dark/80"
                    } max-w-[80%] ${msg.role === "user" ? "text-right" : "text-left"} text-text-light-primary dark:text-text-dark-primary relative`}
                  >
                    <div>
                    <p className="text-text-light-primary dark:text-text-dark-primary mb-1">{msg.content}</p>
                    {msg.debug && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <div>Response Time: {msg.debug.timestamp}</div>
                        <div>Model: {msg.debug.model}</div>
                        <div>Length: {msg.debug.responseLength}</div>
                        <div>Preview: {msg.debug.responsePreview}</div>
                      </div>
                    )}
                  </div>
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
                  className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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

