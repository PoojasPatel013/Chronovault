import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';

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
    if (!message.trim()) return

    setLoading(true)
    setError("")

<<<<<<< HEAD
    try {
      // Check authentication
      if (!isAuthenticated) {
        setError("Please log in to use AI therapy");
        return;
      }

      console.log('Sending message to AI:', message);
      
      // Set up API configuration with correct ports
      const FRONTEND_PORT = 5173;
      const BACKEND_PORT = 8000;
      const API_BASE_URL = import.meta.env.VITE_API_URL || `http://localhost:${BACKEND_PORT}`;
      const API_PATH = '/therapy/ai-session';
      
      console.log('API Configuration:', {
        baseUrl: API_BASE_URL,
        path: API_PATH,
        frontendPort: FRONTEND_PORT,
        backendPort: BACKEND_PORT
      });
      
      const startTime = performance.now();
      
      const res = await fetch(`${API_BASE_URL}${API_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ 
          message,
          userId: user._id
        }),
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      console.log('API Response Time:', responseTime.toFixed(2), 'ms');
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error:', {
          status: res.status,
          headers: Object.fromEntries(res.headers.entries()),
          data: errorData
        });
        throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      
      console.log('AI Response Details:', {
        timestamp: new Date().toISOString(),
        responseLength: data.message?.length,
        debugInfo: data.debug,
        conversationLength: conversation.length + 2
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
        url: `${API_BASE_URL}${API_PATH}`,
        requestTime: performance.now() - startTime,
        stack: err?.stack
      });
=======
    // API Configuration
    const API_PATH = '/api/therapy/ai-session';
    const FULL_URL = API_PATH;  // Vite proxy will handle this path

    // Log configuration details
    console.log('API Configuration Details:', {
      path: API_PATH,
      fullUrl: FULL_URL,
      envUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      proxyTarget: 'http://localhost:8000'
    });

    // Ensure we have a valid token
    const token = Cookies.get('jwt');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    const startTime = performance.now();

    try {
      // Check authentication and token
      if (!isAuthenticated) {
        setError("Please log in to use AI therapy");
        return;
      }

      if (!user.token) {
        setError("Authentication token is missing. Please log out and log in again.");
        return;
      }

      // Log authentication details
      console.log('User Authentication:', {
        isAuthenticated,
        userId: user._id,
        token: user.token ? 'PRESENT' : 'MISSING',
        tokenLength: user.token ? user.token.length : 0
      });

      console.log('Sending message to AI:', message);
      
      // Log request details once
      console.log('Sending request to:', FULL_URL);
      console.log('Request body:', { message, userId: user._id });
      
      const requestStartTime = performance.now();
      console.log('Making API request:', {
        url: FULL_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ 
          message,
          userId: user._id
        })
      });

      try {
        console.log('Sending request to proxy:', FULL_URL);
        const res = await fetch(FULL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ 
            message,
            userId: user._id
          })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorTime = performance.now() - startTime;
          
          console.error('Proxy request failed:', {
            status: res.status,
            headers: Object.fromEntries(res.headers.entries()),
            data: errorData,
            requestTime: errorTime.toFixed(2) + 'ms'
          });
          throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        const responseTime = performance.now() - startTime;

        console.log('Proxy request succeeded:', {
          message: data.message,
          debug: data.debug,
          responseTime: responseTime.toFixed(2) + 'ms'
        });

        // Process successful response
        const messages = [
          { role: "user", content: message },
          { 
            role: "ai", 
            content: data.message,
            debug: data.debug,
            timestamp: new Date().toISOString()
          }
        ];

        setConversation(prev => [...prev, ...messages]);
        setMessage("");
        setLoading(false);
        return;
      } catch (err) {
        console.error('Proxy request failed:', err);
        
        // Try direct request to backend
        const directUrl = `http://localhost:8000${FULL_URL}`;
        console.log('Trying direct request to backend:', directUrl);
        
        try {
          const res = await fetch(directUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({ 
              message,
              userId: user._id
            })
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorTime = performance.now() - startTime;
            
            console.error('Direct request failed:', {
              status: res.status,
              headers: Object.fromEntries(res.headers.entries()),
              data: errorData,
              requestTime: errorTime.toFixed(2) + 'ms'
            });
            throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
          }

          const data = await res.json();
          const responseTime = performance.now() - startTime;

          console.log('Direct request succeeded:', {
            message: data.message,
            debug: data.debug,
            responseTime: responseTime.toFixed(2) + 'ms'
          });

          // Process successful response
          const messages = [
            { role: "user", content: message },
            { 
              role: "ai", 
              content: data.message,
              debug: data.debug,
              timestamp: new Date().toISOString()
            }
          ];

          setConversation(prev => [...prev, ...messages]);
          setMessage("");
          setLoading(false);
          return;
        } catch (directErr) {
          const errorMessage = directErr instanceof Error ? directErr.message : 'An unknown error occurred';
          setError(`Error: ${errorMessage}`);
          setLoading(false);
          
          console.error("Error fetching AI response:", {
            error: directErr,
            message: errorMessage,
            url: directUrl,
            requestTime: performance.now() - startTime,
            request: {
              message,
              userId: user?._id
            },
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`
            }
          });
        }
      }
    } catch (err) {
      console.error('Error fetching AI response:', err);
      setError('Failed to get AI response');
      setLoading(false);
>>>>>>> 4c59dec876db9c1802c262d1b7cf901085a5c4e4
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

