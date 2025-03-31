import mongoose from 'mongoose';
import { IEventDetails } from '../types';

const EventDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  ticketPrice: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    required: true,
  },
  discountEndTime: {
    type: Date,
    required: true,
  },
  momoCode: {
    type: String,
    required: true,
  },
  momoInstructions: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Add static method to get event details
EventDetailsSchema.statics.getEventDetails = async function() {
  let eventDetails = await this.findOne();
  
  if (!eventDetails) {
    eventDetails = await this.create({
      name: process.env.EVENT_NAME || 'NTS Rockstar Party',
      date: new Date(process.env.EVENT_DATE || '2025-05-17T18:00:00'),
      endTime: new Date(process.env.EVENT_END_TIME || '2025-05-17T22:00:00'),
      location: process.env.EVENT_LOCATION || 'Nyanza TSS',
      description: 'Join us for an unforgettable night of music and entertainment!',
      image: '/images/rock1.png',
      ticketPrice: Number(process.env.EVENT_TICKET_PRICE) || 1000,
      discountPrice: Number(process.env.EVENT_DISCOUNT_PRICE) || 800,
      discountEndTime: new Date(process.env.EVENT_DISCOUNT_END_TIME || '2025-05-17T12:00:00'),
      momoCode: process.env.EVENT_MOMO_CODE || '0791786228',
      momoInstructions: process.env.EVENT_MOMO_INSTRUCTIONS || 'Pay using MTN Mobile Money to the number above and keep your transaction ID for verification.',
    });
  }
  
  return eventDetails;
};

export default mongoose.models.EventDetails || mongoose.model<IEventDetails>('EventDetails', EventDetailsSchema); 