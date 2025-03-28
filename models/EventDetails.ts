import mongoose from 'mongoose';
import { IEventDetails, ITicketType } from '../types';

const ticketTypeSchema = new mongoose.Schema<ITicketType>({
  name: {
    type: String,
    required: [true, 'Please provide ticket type name'],
    enum: ['Regular', 'VIP', 'Premium']
  },
  price: {
    type: Number,
    required: [true, 'Please provide ticket price'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    required: [true, 'Please provide discount price'],
    min: [0, 'Discount price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Please provide ticket description'],
    trim: true
  },
  features: [{
    type: String,
    required: [true, 'Please provide ticket features'],
    trim: true
  }],
  discountEndTime: {
    type: Date,
    required: [true, 'Please provide discount end time']
  }
});

const eventDetailsSchema = new mongoose.Schema<IEventDetails>({
  name: {
    type: String,
    required: [true, 'Please provide event name'],
    default: 'NTS Rockstar Party'
  },
  location: {
    type: String,
    required: [true, 'Please provide event location'],
    default: 'Nyanza TSS'
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date']
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide event end time']
  },
  description: {
    type: String,
    required: [true, 'Please provide event description']
  },
  ticketTypes: [ticketTypeSchema],
  momoCode: {
    type: String,
    required: [true, 'Please provide MoMo code']
  },
  momoInstructions: {
    type: String,
    required: [true, 'Please provide MoMo instructions']
  },
  featuredImage: {
    type: String,
    required: [true, 'Please provide featured image URL']
  },
  gallery: [{
    type: String,
    required: [true, 'Please provide gallery image URL']
  }],
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String
  },
  contactInfo: {
    phone: String,
    email: String,
    address: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
eventDetailsSchema.index({ date: 1 });
eventDetailsSchema.index({ 'ticketTypes.name': 1 });

// We only need one event document, so we'll always use the first one
eventDetailsSchema.statics.getEventDetails = async function() {
  let eventDetails = await this.findOne();
  
  if (!eventDetails) {
    eventDetails = await this.create({
      date: new Date('2025-05-17T18:00:00'),
      endTime: new Date('2025-05-17T23:00:00'),
      description: 'Join us for an unforgettable night of music and entertainment!',
      ticketTypes: [{
        name: 'Regular',
        price: 1000,
        discountPrice: 800,
        description: 'Regular ticket with standard amenities',
        features: ['Entry to the event', 'Access to general area'],
        discountEndTime: new Date('2025-05-01T00:00:00')
      }],
      momoCode: '0780000000',
      momoInstructions: 'Pay using MTN Mobile Money to the number above and keep your transaction ID for verification.',
      featuredImage: '/images/rock1.png',
      gallery: ['/images/rock1.png', '/images/rock2.png', '/images/rock3.png']
    });
  }
  
  return eventDetails;
};

const EventDetails = mongoose.models.EventDetails || mongoose.model<IEventDetails>('EventDetails', eventDetailsSchema);
export default EventDetails; 