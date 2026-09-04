import mongoose from 'mongoose';

const weddingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brideName: { type: String, required: true, trim: true }, groomName: { type: String, required: true, trim: true },
  weddingDate: { type: Date, required: true }, venue: { type: String, required: true, trim: true }, city: { type: String, required: true, trim: true },
  guestCount: { type: Number, min: 1, default: 100 }, budget: { type: String, default: '' }, weddingStyle: { type: String, default: 'Contemporary' }, colorTheme: { type: String, default: 'Warm neutrals' }, description: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'planning', 'generating', 'ai_generated', 'under_review', 'approved', 'in_production', 'completed'], default: 'planning' },
  aiError: { type: String, default: undefined },
  assignedEditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Indexes for production query performance
weddingSchema.index({ clientId: 1, status: 1 });
weddingSchema.index({ assignedEditor: 1 });
weddingSchema.index({ status: 1, updatedAt: -1 });

export default mongoose.model('Wedding', weddingSchema);
