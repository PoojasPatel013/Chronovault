// backend/routes/personality.js
import { Router } from 'express';
import { getQuestions, getPersonalityType } from '../services/personalityService.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get personality questions (public endpoint)
router.get('/questions', async (req, res) => {
  try {
    const response = await fetch('https://16personalities-api.com/api/personality/questions');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching personality questions:', error);
    res.status(500).json({ message: 'Failed to fetch personality questions' });
  }
});

// Get personality type (requires authentication)
router.post('/type', auth, async (req, res) => {
  try {
    const { answers, gender } = req.body;
    
    if (!answers || !gender) {
      return res.status(400).json({ message: 'Answers and gender are required' });
    }

    const response = await fetch('https://16personalities-api.com/api/personality', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers,
        gender
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get personality type');
    }

    const personalityType = await response.json();
    
    // Save personality type to user's profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { personalityType },
      { new: true }
    );

    res.json(personalityType);
  } catch (error) {
    console.error('Error getting personality type:', error);
    res.status(500).json({ message: 'Failed to get personality type' });
  }
});

// Get user's personality type (requires authentication)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('personalityType');
    if (!user || !user.personalityType) {
      return res.status(404).json({ message: 'Personality type not found' });
    }
    res.json(user.personalityType);
  } catch (error) {
    console.error('Error fetching personality:', error);
    res.status(500).json({ message: 'Failed to fetch personality data' });
  }
});

export default router;