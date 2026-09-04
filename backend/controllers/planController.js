import VideoPlan from '../models/VideoPlan.js';
import HighlightVideo from '../models/HighlightVideo.js';
import AlbumDesign from '../models/AlbumDesign.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { canAccessWedding } from './weddingController.js';

const latest = (Model, filter) => Model.aggregate([{ $match: filter }, { $sort: { version: -1, updatedAt: -1 } }, { $group: { _id: '$functionName', doc: { $first: '$$ROOT' } } }, { $replaceRoot: { newRoot: '$doc' } }]);
export const listVideoPlans = asyncHandler(async (req, res) => { await canAccessWedding(req.params.weddingId, req.user); const plans = await latest(VideoPlan, { weddingId: new mongoose.Types.ObjectId(req.params.weddingId) }); res.json({ plans }); });
export const getVideoPlan = asyncHandler(async (req, res) => { const plan = await VideoPlan.findById(req.params.id); if (!plan) throw new AppError('Video plan not found.', 404); await canAccessWedding(plan.weddingId, req.user); res.json({ plan }); });
export const updateVideoPlan = asyncHandler(async (req, res) => { const plan = await VideoPlan.findById(req.params.id); if (!plan) throw new AppError('Video plan not found.', 404); await canAccessWedding(plan.weddingId, req.user, true); Object.assign(plan, req.body); await plan.save(); res.json({ plan }); });
export const getHighlight = asyncHandler(async (req, res) => { await canAccessWedding(req.params.weddingId, req.user); const highlight = await HighlightVideo.findOne({ weddingId: req.params.weddingId }).sort('-version'); res.json({ highlight }); });
export const updateHighlight = asyncHandler(async (req, res) => { const highlight = await HighlightVideo.findById(req.params.id); if (!highlight) throw new AppError('Highlight plan not found.', 404); await canAccessWedding(highlight.weddingId, req.user, true); Object.assign(highlight, req.body); await highlight.save(); res.json({ highlight }); });
export const getAlbum = asyncHandler(async (req, res) => { await canAccessWedding(req.params.weddingId, req.user); const albumDesign = await AlbumDesign.findOne({ weddingId: req.params.weddingId }).sort('-version'); res.json({ albumDesign }); });
export const updateAlbum = asyncHandler(async (req, res) => { const albumDesign = await AlbumDesign.findById(req.params.id); if (!albumDesign) throw new AppError('Album design not found.', 404); await canAccessWedding(albumDesign.weddingId, req.user, true); Object.assign(albumDesign, req.body); await albumDesign.save(); res.json({ albumDesign }); });
