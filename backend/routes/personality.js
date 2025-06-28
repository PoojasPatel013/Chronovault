// backend/routes/personality.js
import { Router } from 'express';
import { personalityQuestions } from '../data/personalityQuestions.js';
import { personalityTypes } from '../data/personalityTypes.js';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

// Protected endpoint to get questions
router.get('/questions', auth, (req, res) => {
  res.json(personalityQuestions);
});

// Protected endpoint to calculate personality type
router.post('/calculate', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers) || answers.length !== personalityQuestions.length) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Initialize dimension counters
    const dimensions = {
      E: 0,
      I: 0,
      S: 0,
      N: 0,
      T: 0,
      F: 0,
      J: 0,
      P: 0
    };

    // Tally answers
    answers.forEach((answer, index) => {
      if (answer < 0 || answer >= personalityQuestions[index].options.length) {
        throw new Error('Invalid answer index');
      }
      const dimension = personalityQuestions[index].options[answer].dimension;
      dimensions[dimension]++;
    });

    // Determine dominant dimensions
    const type = [
      dimensions.E > dimensions.I ? 'E' : 'I',
      dimensions.S > dimensions.N ? 'S' : 'N',
      dimensions.T > dimensions.F ? 'T' : 'F',
      dimensions.J > dimensions.P ? 'J' : 'P'
    ].join('');

    // Save personality type to user
    const user = await User.findById(req.user._id);
    if (user) {
      user.personalityType = type;
      await user.save();
    }

    // Find matching personality type
    const personality = personalityTypes.find(pt => pt.type === type);
    if (!personality) {
      throw new Error('Personality type not found');
    }

    res.json({
      type,
      name: personality.name,
      description: personality.description,
      traits: personality.traits
    });
  } catch (error) {
    console.error('Error calculating personality:', error);
    res.status(400).json({ message: error.message });
  }
});

// Authenticated endpoint to save personality type to user profile
router.post('/save', auth, async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!type || typeof type !== 'string' || type.length !== 4) {
      return res.status(400).json({ message: 'Invalid personality type' });
    }

    // Save to user's profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { personalityType: type },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Personality type saved successfully',
      personalityType: type
    });
  } catch (error) {
    console.error('Error saving personality type:', error);
    res.status(500).json({ message: 'Failed to save personality type' });
  }
});

// Authenticated endpoint to get user's saved personality type
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('personalityType');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      personalityType: user.personalityType
    });
  } catch (error) {
    console.error('Error getting user personality:', error);
    res.status(500).json({ message: 'Failed to get personality type' });
  }
});

export default router;