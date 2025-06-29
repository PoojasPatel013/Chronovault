import { Router } from "express";
const router = Router();
import { GoogleGenerativeAI } from "@google/generative-ai";
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import cors from 'cors';

// Enable CORS for frontend port (5173)
const frontendPort = 5173;
const corsOptions = {
  origin: `http://localhost:${frontendPort}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

router.use(cors(corsOptions));

// ✅ Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/therapy/ai-session", cors(corsOptions), auth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔹 Use the correct model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // ✅ Send request to Gemini
    // Add user context to the prompt
    const prompt = `You are a compassionate therapist. The user is ${user.name}. 
    They are seeking help with their mental well-being. 
    ${message}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Log detailed AI response structure
    console.log("AI Response Structure:");
    console.log("Candidates:", result?.response?.candidates?.length);
    console.log("First Candidate:", JSON.stringify(result?.response?.candidates?.[0], null, 2));

    // Extract response with detailed error handling
    const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!response) {
      console.error("AI Response Analysis:");
      console.error("Raw Response:", JSON.stringify(result, null, 2));
      console.error("Candidates:", result?.response?.candidates);
      console.error("First Content:", result?.response?.candidates?.[0]?.content);
      console.error("First Part:", result?.response?.candidates?.[0]?.content?.parts?.[0]);
      
      throw new Error("Failed to extract AI response. Response structure may have changed.");
    }

    if (!response) {
      console.error("❌ AI Response Missing or Undefined");
      return res.status(500).json({ error: "Failed to generate AI response", details: "No response from AI" });
    }

    // Save conversation history
    try {
      await User.findByIdAndUpdate(userId, {
        $push: {
          therapyHistory: {
            message: message,
            response: response,
            timestamp: new Date()
          }
        }
      });
    } catch (err) {
      console.error("Error saving therapy history:", err);
    }

    // Add debug information to response
    res.json({ 
      message: response,
      debug: {
        timestamp: new Date().toISOString(),
        model: "gemini-1.5-pro",
        responseLength: response.length,
        responsePreview: response.substring(0, 100) + (response.length > 100 ? '...' : '')
      }
    });
  } catch (err) {
    console.error("❌ AI Session Error:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });

    const statusCode = err.status || 500;
    const response = {
      error: "Server error",
      details: err.message,
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        path: req.path,
        headers: Object.fromEntries(Object.entries(req.headers).filter(([k]) => !k.startsWith('cookie')))
      }
    };

    res.status(statusCode).json(response);
  }
});

export default router;