import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import cors from 'cors';

const router = express.Router();

// Enable CORS for frontend port (5173)
const frontendPort = 5173;
const corsOptions = {
  origin: `http://localhost:${frontendPort}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

router.use(cors(corsOptions));

// ✅ Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/therapy/ai-session", cors(corsOptions), verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    console.log('Processing AI request:', {
      messageId: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      userId,
      timestamp: new Date().toISOString()
    });

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Use Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('Initialized Gemini Model:', {
      model: 'gemini-1.5-flash',
      apiKey: process.env.GEMINI_API_KEY ? 'PRESENT' : 'MISSING'
    });

    // Send request to Gemini
    const prompt = `You are a compassionate therapist. The user is ${user.name}. 
    They are seeking help with their mental well-being. 
    ${message}`;

    const startTime = performance.now();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log response details
    console.log('AI Response Details:', {
      responseTime: duration.toFixed(2) + 'ms',
      responseLength: result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.length,
      timestamp: new Date().toISOString(),
      model: 'gemini-1.5-flash'
    });

    // Log detailed AI response structure
    console.log("AI Response Structure:");
    console.log("Candidates:", result?.response?.candidates?.length);
    console.log("First Candidate:", JSON.stringify(result?.response?.candidates?.[0], null, 2));

    // Extract response text
    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

    // Save conversation history
    try {
      await User.findByIdAndUpdate(userId, {
        $push: {
          therapyHistory: {
            message: message,
            response: responseText,
            timestamp: new Date()
          }
        }
      });
    } catch (err) {
      console.error("Error saving therapy history:", err);
    }

    // Add debug information to response
    res.json({ 
      message: responseText,
      debug: {
        timestamp: new Date().toISOString(),
        model: 'gemini-pro',
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 50) + '...',
        requestMessage: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        userId,
        responseTime: duration.toFixed(2) + 'ms'
      }
    });
  } catch (error) {
    console.error('Error in AI session:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      error: 'Internal server error',
      debug: {
        timestamp: new Date().toISOString(),
        errorType: error.name,
        errorMessage: error.message
      }
    });
  } 

});

export const therapyRouter = router;