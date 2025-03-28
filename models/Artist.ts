import mongoose from 'mongoose';
import { IArtist } from '../types';

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide artist name'],
    maxlength: [100, 'Artist name cannot be more than 100 characters'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide artist description'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL for the artist'],
    validate: {
      validator: function(v: string) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  videos: [{
    title: {
      type: String,
      required: [true, 'Please provide video title']
    },
    url: {
      type: String,
      required: [true, 'Please provide video URL'],
      validate: {
        validator: function(v: string) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: 'Please provide a valid video URL'
      }
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
ArtistSchema.index({ name: 1 });
ArtistSchema.index({ featured: 1 });

const Artist = mongoose.models.Artist || mongoose.model<IArtist>('Artist', ArtistSchema);
export default Artist; 