import mongoose from 'mongoose';
import { IHomeUpdate } from '../types';

const homeUpdateSchema = new mongoose.Schema<IHomeUpdate>({
  title: {
    type: String,
    required: [true, 'Please provide update title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide update content'],
    trim: true
  },
  type: {
    type: String,
    enum: ['announcement', 'news', 'image', 'video'],
    required: [true, 'Please provide update type']
  },
  imageUrl: {
    type: String,
    required: function(this: IHomeUpdate) { 
      return this.type === 'image';
    }
  },
  videoUrl: {
    type: String,
    required: function(this: IHomeUpdate) { 
      return this.type === 'video';
    }
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better query performance
homeUpdateSchema.index({ createdAt: -1 });
homeUpdateSchema.index({ type: 1 });
homeUpdateSchema.index({ isPublished: 1 });

// Update the updatedAt timestamp before saving
homeUpdateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const HomeUpdate = mongoose.models.HomeUpdate || mongoose.model<IHomeUpdate>('HomeUpdate', homeUpdateSchema);
export default HomeUpdate; 