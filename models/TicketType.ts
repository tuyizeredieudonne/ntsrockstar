import mongoose from 'mongoose';

const ticketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this ticket type'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price for this ticket type'],
  },
  discountPrice: {
    type: Number,
    required: false,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for this ticket type'],
  },
  features: {
    type: [String],
    default: [],
  },
  discountEndTime: {
    type: Date,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  maxQuantity: {
    type: Number,
    default: 100,
  },
  soldQuantity: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
ticketTypeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const TicketType = mongoose.models.TicketType || mongoose.model('TicketType', ticketTypeSchema);

export default TicketType; 