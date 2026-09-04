import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

const tokenFor = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const respond = (res, user, status = 200) =>
  res.status(status).json({
    token: tokenFor(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'client' } = req.body;
  // req.body is already sanitised by validateBody middleware
  if (role !== 'client') {
    throw new AppError('Public registration supports client accounts only.');
  }
  // Normalise email before DB query to prevent NoSQL injection via object operators
  const normEmail = String(email).trim().toLowerCase();
  if (await User.findOne({ email: normEmail })) {
    throw new AppError('An account with this email already exists.', 409);
  }
  const user = await User.create({ name: String(name).trim(), email: normEmail, password, role });
  respond(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Coerce to string and normalise — prevents { $gt: '' } injection
  const normEmail = String(email ?? '').trim().toLowerCase();
  const user = await User.findOne({ email: normEmail }).select('+password');
  if (!user || !(await user.matchPassword(String(password ?? '')))) {
    throw new AppError('Invalid email or password.', 401);
  }
  respond(res, user);
});

export const me = asyncHandler(async (req, res) => res.json({ user: req.user }));
