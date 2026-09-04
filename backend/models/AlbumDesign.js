import mongoose from 'mongoose';
const pageSchema = new mongoose.Schema({ pageNumber: Number, layout: String, photoCount: Number, photoTypes: { type: [String], default: [] }, description: String, designNotes: String }, { _id: false });
const albumDesignSchema = new mongoose.Schema({
  weddingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wedding', required: true, index: true }, theme: String, concept: String, colorPalette: { type: [String], default: [] }, typography: String, coverSuggestion: String, pageStructure: { type: [pageSchema], default: [] }, photographyStyle: String, layoutNotes: { type: [String], default: [] }, status: { type: String, enum: ['draft', 'review', 'approved'], default: 'draft' }, version: { type: Number, default: 1 }, generatedByAI: { type: Boolean, default: true }
}, { timestamps: true });
albumDesignSchema.index({ weddingId: 1, version: -1 });
export default mongoose.model('AlbumDesign', albumDesignSchema);
