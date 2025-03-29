import mongoose from 'mongoose';
import { IArtist } from '../types';

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
  },
}, {
  timestamps: true,
});

// Add index for better query performance
ArtistSchema.index({ name: 1 });

export default mongoose.models.Artist || mongoose.model<IArtist>('Artist', ArtistSchema); 