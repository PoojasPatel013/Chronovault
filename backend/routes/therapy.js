import { Router } from "express";
const router = Router();
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/ai-session", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔹 Use the correct model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // ✅ Send request to Gemini
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    console.log("✅ AI API Raw Response:", JSON.stringify(result, null, 2));

    // ✅ Fix response extraction
    const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!response) {
      console.error("❌ AI Response Missing or Undefined");
      return res.status(500).json({ error: "Failed to generate AI response" });
    }

    res.json({ message: response });
  } catch (err) {
    console.error("❌ AI Session Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
