import { Router } from 'express';
import TimeCapsule from '../models/TimeCapsule.js';
import { verifyToken } from '../middleware/auth.js';
import express from 'express';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, file, unlockDate, isPublic } = req.body;
    const newTimeCapsule = new TimeCapsule({
      content,
      file,
      unlockDate,
      isPublic,
      createdBy: req.user.id
    });

    const savedTimeCapsule = await newTimeCapsule.save();
    res.json(savedTimeCapsule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/public', async (req, res) => {
  try {
    const publicCapsules = await TimeCapsule.find({ isPublic: true, unlockDate: { $lte: new Date() } }) 
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(publicCapsules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/user', verifyToken, async (req, res) => {
  try {
    const userCapsules = await TimeCapsule.find({ createdBy: req.user.id }) 
      .sort({ createdAt: -1 });
    res.json(userCapsules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export const timeCapsuleRouter = router;
