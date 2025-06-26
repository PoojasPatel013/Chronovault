// backend/routes/users.js
import { Router } from 'express';
import auth from '../middleware/auth.js';

const router = Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's time capsules
router.get('/time-capsules', auth, async (req, res) => {
  try {
    const timeCapsules = await TimeCapsule.find({ userId: req.user._id });
    res.json(timeCapsules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time capsules' });
  }
});

export default router;