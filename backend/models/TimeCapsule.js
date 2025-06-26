// models/TimeCapsule.js
import { Schema, model } from 'mongoose';

const TimeCapsuleSchema = new Schema({
  content: { type: String, required: true },
  file: { type: String },
  unlockDate: { type: Date, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model('TimeCapsule', TimeCapsuleSchema);