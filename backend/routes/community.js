// backend/routes/community.js
import { Router } from 'express';
import auth from '../middleware/auth.js';

const router = Router();

// Get all public time capsules
router.get('/time-capsules', auth, async (req, res) => {
  try {
    const timeCapsules = await TimeCapsule.find({
      isPublic: true,
      unlockDate: { $lte: new Date() }
    })
    .populate('createdBy', 'username avatar')
    .sort({ createdAt: -1 });
    
    res.json(timeCapsules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch community time capsules' });
  }
});

// Get user's public time capsules
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const timeCapsules = await TimeCapsule.find({
      createdBy: user._id,
      isPublic: true,
      unlockDate: { $lte: new Date() }
    })
    .sort({ createdAt: -1 });

    res.json(timeCapsules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user time capsules' });
  }
});

// Create a new public time capsule
router.post('/time-capsules', auth, async (req, res) => {
  try {
    const { title, content, file, isPublic } = req.body;
    
    const timeCapsule = new TimeCapsule({
      title,
      content,
      file,
      createdBy: req.user._id,
      isPublic: isPublic || false,
      unlockDate: new Date()
    });

    await timeCapsule.save();
    res.status(201).json(timeCapsule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create time capsule' });
  }
});

// Update time capsule visibility
router.put('/time-capsules/:id/public', auth, async (req, res) => {
  try {
    const timeCapsule = await TimeCapsule.findById(req.params.id);
    if (!timeCapsule) {
      return res.status(404).json({ error: 'Time capsule not found' });
    }

    if (timeCapsule.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this time capsule' });
    }

    timeCapsule.isPublic = !timeCapsule.isPublic;
    await timeCapsule.save();
    res.json(timeCapsule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update time capsule visibility' });
  }
});

export default router;