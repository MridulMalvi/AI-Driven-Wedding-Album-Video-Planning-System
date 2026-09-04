import mongoose from 'mongoose';
const timelineSchema = new mongoose.Schema({ timestamp: String, section: String, description: String, footageSource: String, music: String, transition: String }, { _id: false });
const highlightVideoSchema = new mongoose.Schema({
  weddingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wedding', required: true, index: true }, totalDuration: Number, concept: String, story: String, timeline: { type: [timelineSchema], default: [] }, opening: String, emotionalPeak: String, finale: String, musicDirection: String, editingStyle: String, status: { type: String, enum: ['draft', 'review', 'approved'], default: 'draft' }, version: { type: Number, default: 1 }
}, { timestamps: true });
highlightVideoSchema.index({ weddingId: 1, version: -1 });
export default mongoose.model('HighlightVideo', highlightVideoSchema);
