import Wedding from '../models/Wedding.js';
import Function from '../models/Function.js';
import VideoPlan from '../models/VideoPlan.js';
import HighlightVideo from '../models/HighlightVideo.js';
import AlbumDesign from '../models/AlbumDesign.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const canAccessWedding = async (id, user, edit = false) => {
  const wedding = await Wedding.findById(id).populate('clientId', 'name email').populate('assignedEditor', 'name email');
  if (!wedding) throw new AppError('Wedding not found.', 404);
  const owner = wedding.clientId._id.toString() === user._id.toString();
  const assignee = wedding.assignedEditor?._id?.toString() === user._id.toString();
  if (user.role === 'admin' || owner || (!edit && assignee)) return wedding;
  throw new AppError('You do not have access to this wedding.', 403);
};
export const createWedding = asyncHandler(async (req, res) => { const payload = { ...req.body, clientId: req.user._id, status: 'planning' }; const wedding = await Wedding.create(payload); const functions = Array.isArray(req.body.functions) ? await Function.insertMany(req.body.functions.map((f) => ({ ...f, weddingId: wedding._id }))) : []; res.status(201).json({ wedding, functions }); });
export const listWeddings = asyncHandler(async (req, res) => { const filter = req.user.role === 'client' ? { clientId: req.user._id } : req.user.role === 'editor' ? { assignedEditor: req.user._id } : {}; const weddings = await Wedding.find(filter).populate('clientId', 'name email').populate('assignedEditor', 'name email').sort('-updatedAt'); res.json({ weddings }); });
export const getWedding = asyncHandler(async (req, res) => { const wedding = await canAccessWedding(req.params.id, req.user); const functions = await Function.find({ weddingId: wedding._id }).sort('date startTime'); res.json({ wedding, functions }); });
export const updateWedding = asyncHandler(async (req, res) => { const wedding = await canAccessWedding(req.params.id, req.user, true); const forbidden = ['clientId', 'assignedEditor', 'status']; forbidden.forEach((k) => delete req.body[k]); Object.assign(wedding, req.body); await wedding.save(); res.json({ wedding }); });
export const deleteWedding = asyncHandler(async (req, res) => { const wedding = await canAccessWedding(req.params.id, req.user, true); await Promise.all([Function.deleteMany({ weddingId: wedding._id }), VideoPlan.deleteMany({ weddingId: wedding._id }), HighlightVideo.deleteMany({ weddingId: wedding._id }), AlbumDesign.deleteMany({ weddingId: wedding._id }), wedding.deleteOne()]); res.status(204).send(); });
export const addFunction = asyncHandler(async (req, res) => { const wedding = await canAccessWedding(req.params.weddingId, req.user, true); const fn = await Function.create({ ...req.body, weddingId: wedding._id }); res.status(201).json({ function: fn }); });
export const listFunctions = asyncHandler(async (req, res) => { await canAccessWedding(req.params.weddingId, req.user); res.json({ functions: await Function.find({ weddingId: req.params.weddingId }).sort('date startTime') }); });
export const updateFunction = asyncHandler(async (req, res) => { const fn = await Function.findById(req.params.id); if (!fn) throw new AppError('Function not found.', 404); await canAccessWedding(fn.weddingId, req.user, true); Object.assign(fn, req.body); await fn.save(); res.json({ function: fn }); });
export const deleteFunction = asyncHandler(async (req, res) => { const fn = await Function.findById(req.params.id); if (!fn) throw new AppError('Function not found.', 404); await canAccessWedding(fn.weddingId, req.user, true); await fn.deleteOne(); res.status(204).send(); });
