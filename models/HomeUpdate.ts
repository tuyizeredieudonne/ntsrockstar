import mongoose from 'mongoose';

const HomeUpdateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['announcement', 'news', 'image', 'video'],
  },
  imageUrl: {
    type: String,
    required: function() {
      return this.type === 'image';
    },
  },
  videoUrl: {
    type: String,
    required: function() {
      return this.type === 'video';
    },
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Add index for better query performance
HomeUpdateSchema.index({ createdAt: -1 });
HomeUpdateSchema.index({ isPublished: 1 });

export default mongoose.models.HomeUpdate || mongoose.model('HomeUpdate', HomeUpdateSchema); 