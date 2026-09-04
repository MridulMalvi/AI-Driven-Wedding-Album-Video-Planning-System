import Wedding from '../models/Wedding.js';
import User from '../models/User.js';
import VideoPlan from '../models/VideoPlan.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

const allowedTransitions = {
  draft: ['planning'],
  planning: ['ai_generated'],
  generating: ['planning'],          // admin can reset a stuck generation
  ai_generated: ['under_review', 'approved'],
  under_review: ['approved', 'planning'],
  approved: ['in_production'],
  in_production: ['completed'],
  completed: [],
};

/** Parse pagination query params; returns { skip, limit, page } */
const paginate = (query, defaultLimit = 20) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  return { limit, skip: (page - 1) * limit, page };
};

export const dashboard = asyncHandler(async (_req, res) => {
  const [total, active, generated, pending, completed, recent] = await Promise.all([
    Wedding.countDocuments(),
    Wedding.countDocuments({ status: { $in: ['planning', 'ai_generated', 'under_review', 'approved', 'in_production'] } }),
    VideoPlan.countDocuments(),
    Wedding.countDocuments({ status: 'under_review' }),
    Wedding.countDocuments({ status: 'completed' }),
    Wedding.find().populate('clientId', 'name').populate('assignedEditor', 'name').sort('-updatedAt').limit(6),
  ]);
  res.json({ stats: { total, active, generated, pending, completed }, recent });
});

export const weddings = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const { limit, skip, page } = paginate(req.query);
  const [total, items] = await Promise.all([
    Wedding.countDocuments(filter),
    Wedding.find(filter)
      .populate('clientId', 'name email')
      .populate('assignedEditor', 'name email')
      .sort('-updatedAt')
      .skip(skip)
      .limit(limit),
  ]);
  res.json({ weddings: items, total, page, pages: Math.ceil(total / limit) });
});

export const users = asyncHandler(async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  const { limit, skip, page } = paginate(req.query);
  const [total, items] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(limit),
  ]);
  res.json({ users: items, total, page, pages: Math.ceil(total / limit) });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const wedding = await Wedding.findById(req.params.id);
  if (!wedding) throw new AppError('Wedding not found.', 404);
  const next = req.body.status;
  if (!allowedTransitions[wedding.status]?.includes(next)) {
    throw new AppError(`Cannot move from '${wedding.status}' to '${next}'.`);
  }
  wedding.status = next;
  await wedding.save();
  res.json({ wedding });
});

export const assignEditor = asyncHandler(async (req, res) => {
  const { editorId } = req.body;
  const [wedding, editor] = await Promise.all([
    Wedding.findById(req.params.id),
    User.findOne({ _id: editorId, role: 'editor' }),
  ]);
  if (!wedding) throw new AppError('Wedding not found.', 404);
  if (!editor) throw new AppError('Select a valid editor.', 400);
  wedding.assignedEditor = editor._id;
  if (wedding.status === 'approved') wedding.status = 'in_production';
  await wedding.save();
  res.json({ wedding });
});
