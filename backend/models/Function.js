import mongoose from 'mongoose';

const functionSchema = new mongoose.Schema({
  weddingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wedding', required: true, index: true },
  name: { type: String, required: true, trim: true }, date: { type: Date, required: true }, startTime: { type: String, default: '' }, endTime: { type: String, default: '' }, venue: { type: String, default: '' }, duration: { type: Number, default: 0 },
  importance: { type: String, enum: ['low', 'medium', 'high'], default: 'high' }, description: { type: String, default: '' }, specialMoments: { type: [String], default: [] }, dressCode: { type: String, default: '' }
}, { timestamps: true });
export default mongoose.model('Function', functionSchema);
