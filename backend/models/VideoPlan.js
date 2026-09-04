import mongoose from 'mongoose';
const shotSchema = new mongoose.Schema({ shotNumber: Number, shotType: String, description: String, duration: Number, cameraSuggestion: String, movement: String, priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' } }, { _id: false });
const videoPlanSchema = new mongoose.Schema({
  weddingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wedding', required: true, index: true }, functionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Function', default: null }, functionName: { type: String, required: true }, objective: String, estimatedDuration: Number, shots: { type: [shotSchema], default: [] }, musicSuggestion: String, transitionStyle: String, colorGrading: String, importantMoments: { type: [String], default: [] }, equipmentSuggestions: { type: [String], default: [] }, editingNotes: { type: [String], default: [] }, status: { type: String, enum: ['draft', 'review', 'approved'], default: 'draft' }, version: { type: Number, default: 1 }, generatedByAI: { type: Boolean, default: true }
}, { timestamps: true });
videoPlanSchema.index({ weddingId: 1, version: -1 });
videoPlanSchema.index({ weddingId: 1, functionName: 1, version: -1 });
export default mongoose.model('VideoPlan', videoPlanSchema);
