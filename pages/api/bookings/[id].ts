import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query: { id } } = req;

  await dbConnect();

  // Check admin authentication for all methods except GET
  if (method !== 'GET') {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  }

  switch (method) {
    case 'GET':
      try {
        const booking = await Booking.findById(id);
        
        if (!booking) {
          return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        return res.status(200).json({ success: true, data: booking });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    case 'PUT':
      try {
        const booking = await Booking.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        
        if (!booking) {
          return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        return res.status(200).json({ success: true, data: booking });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    case 'DELETE':
      try {
        const deletedBooking = await Booking.deleteOne({ _id: id });
        
        if (!deletedBooking) {
          return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        return res.status(200).json({ success: true, data: {} });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(400).json({ success: false, message: 'Method not allowed' });
  }
} 