import mongoose from 'mongoose';
import { IHomeUpdate } from '../types';

const HomeUpdateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Add index for better query performance
HomeUpdateSchema.index({ createdAt: -1 });

export default mongoose.models.HomeUpdate || mongoose.model<IHomeUpdate>('HomeUpdate', HomeUpdateSchema); 