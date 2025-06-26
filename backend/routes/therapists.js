import { Router } from 'express';
const router = Router();
import auth from '../middleware/auth.js';
import Therapist from '../models/Therapist.js'; // ✅ Correct import

// Get all therapists
router.get('/', async (req, res) => {
  try {
    const therapists = await Therapist.find(); // ✅ Corrected usage
    res.json(therapists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Book an appointment with a therapist
router.post('/book', auth, async (req, res) => {
  try {
    const { therapistId, date } = req.body;
    
    // Find the therapist
    const therapist = await Therapist.findById(therapistId); // ✅ Corrected usage

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    // Check if the date is available
    const dateObj = new Date(date);
    if (therapist.availability.some(d => new Date(d).toISOString() === dateObj.toISOString())) {
      therapist.availability = therapist.availability.filter(d => new Date(d).toISOString() !== dateObj.toISOString());
      await therapist.save();

      res.json({ message: 'Appointment booked successfully', date });
    } else {
      res.status(400).json({ message: 'Selected date is not available' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
