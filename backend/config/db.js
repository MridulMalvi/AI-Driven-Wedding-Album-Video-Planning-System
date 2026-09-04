import mongoose from 'mongoose';

export const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured. Copy .env.example to .env and add your MongoDB connection string.');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};
