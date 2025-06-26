// routes/personality.js
import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/analyze', auth, async (req, res) => {
  try {
    const { answers } = req.body;

    // Prepare the prompt for Gemini
    const prompt = `Based on the following personality test answers, provide a brief personality analysis:
    ${Object.entries(answers).map(([question, answer]) => `${question}: ${answer}`).join('\n')}
    
    Provide a concise analysis of the person's personality traits, strengths, and potential areas for growth.`;

    // Generate content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({ analysis });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;