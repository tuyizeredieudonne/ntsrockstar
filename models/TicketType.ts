import mongoose from 'mongoose';
import { ITicketType } from '../types';

const TicketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  features: [{
    type: String,
  }],
  discountPrice: {
    type: Number,
    min: 0,
    required: false,
    default: undefined
  },
  discountEndTime: {
    type: Date,
    required: false,
    default: undefined
  },
  totalTickets: {
    type: Number,
    required: true,
    min: 0,
    default: 100,
  },
  soldTickets: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  availableTickets: {
    type: Number,
    required: true,
    min: 0,
    default: function() {
      return this.totalTickets;
    }
  },
  isSoldOut: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Add a pre-save middleware to check if tickets are sold out and update available tickets
TicketTypeSchema.pre('save', function(next) {
  // Calculate available tickets
  this.availableTickets = this.totalTickets - this.soldTickets;
  
  // Update sold out status
  this.isSoldOut = this.availableTickets <= 0;
  
  // Validate that sold tickets don't exceed total tickets
  if (this.soldTickets > this.totalTickets) {
    next(new Error('Sold tickets cannot exceed total tickets'));
  } else {
    next();
  }
});

// Validate discount price if it exists
TicketTypeSchema.pre('save', function(next) {
  if (this.discountPrice && this.discountPrice >= this.price) {
    next(new Error('Discount price must be less than regular price'));
  } else {
    next();
  }
});

export default mongoose.models.TicketType || mongoose.model<ITicketType>('TicketType', TicketTypeSchema); 