import { Router } from 'express';
const router = Router();
import TimeCapsule from '../models/TimeCapsule.js'; // ✅ Corrected import
import auth from '../middleware/auth.js';

router.post('/', auth, async (req, res) => {
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
    const publicCapsules = await TimeCapsule.find({ isPublic: true, unlockDate: { $lte: new Date() } }) // ✅ Corrected
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(publicCapsules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const userCapsules = await TimeCapsule.find({ createdBy: req.user.id }) // ✅ Corrected
      .sort({ createdAt: -1 });
    res.json(userCapsules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
