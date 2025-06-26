// backend/models/TimeCapsule.js
import mongoose from 'mongoose';

const timeCapsuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, required: true },
  weather: { type: String, required: true },
  timestamp: { type: Date, required: true },
  unlockDate: { type: Date, required: true }
});

export default mongoose.model('TimeCapsule', timeCapsuleSchema);