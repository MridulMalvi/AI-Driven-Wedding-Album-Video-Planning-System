import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const token =
    req.headers.authorization?.startsWith('Bearer ') &&
    req.headers.authorization.split(' ')[1];

  if (!token) throw new AppError('Please log in to access this resource.', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Your session has expired. Please log in again.', 401);
    }
    throw new AppError('Your session is invalid. Please log in again.', 401);
  }

  req.user = await User.findById(decoded.id).select('-password');
  if (!req.user) throw new AppError('This account no longer exists.', 401);

  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You are not authorized for this action.', 403));
  }
  next();
};
