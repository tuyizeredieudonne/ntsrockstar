import mongoose from 'mongoose';
import { IBooking } from '../types';

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventDetails',
    required: true,
  },
  ticketType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TicketType',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  pricePaid: {
    type: Number,
    required: true,
  },
  discountApplied: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  momoTransactionId: {
    type: String,
    required: true,
  },
  paymentScreenshot: {
    type: String,
    required: [true, 'Payment screenshot is required'],
    validate: {
      validator: function(v: string) {
        return v && v.length > 0;
      },
      message: 'Payment screenshot URL cannot be empty'
    }
  },
  studentLevel: {
    type: String,
    required: false,
    default: 'Not Specified'
  },
  trade: {
    type: String,
    required: false,
    default: 'Not Specified'
  }
}, {
  timestamps: true,
});

// Add a pre-save middleware to validate payment screenshot
BookingSchema.pre('save', function(next) {
  if (!this.paymentScreenshot) {
    next(new Error('Payment screenshot is required'));
  } else {
    next();
  }
});

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema); 