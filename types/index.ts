import mongoose from 'mongoose';

export interface IArtist {
  name: string;
  image: string;
  description: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventDetails {
  name: string;
  date: Date;
  endTime: Date;
  location: string;
  description: string;
  image: string;
  ticketPrice: number;
  discountPrice: number;
  discountEndTime: Date;
  momoCode: string;
  momoInstructions: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHomeUpdate {
  title: string;
  content: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  studentLevel?: string;
  trade?: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketType {
  name: string;
  price: number;
  discountPrice: number;
  description: string;
  features: string[];
  discountEndTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  ticketType: mongoose.Types.ObjectId;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  momoTransactionId: string;
  paymentScreenshot: string;
  createdAt: Date;
  updatedAt: Date;
} 