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
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.TicketType || mongoose.model<ITicketType>('TicketType', TicketTypeSchema); 