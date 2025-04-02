import mongoose from 'mongoose';
import { IBooking } from '../types';

const BookingSchema = new mongoose.Schema(
  {
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
      default: 1,
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
      required: false, // Ensures it is optional
      validate: {
        validator: function (v: string | undefined) {
          return !v || v.length > 0; // Allows empty or valid string
        },
        message: 'Payment screenshot URL cannot be empty',
      },
    },
    studentLevel: {
      type: String,
      required: true,
      enum: ['L3', 'L4', 'L5', 'Not Specified'],
      default: 'Not Specified',
    },
    trade: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      default: 'Not Specified',
    },
  },
  {
    timestamps: true,
  }
);

// Remove the pre-save middleware as it's redundant.
export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema
