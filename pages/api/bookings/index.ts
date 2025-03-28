import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || session.user.role !== 'admin') {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const bookings = await Booking.find({}).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: bookings });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    case 'POST':
      try {
        const booking = await Booking.create(req.body);
        return res.status(201).json({ success: true, data: booking });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(400).json({ success: false, message: 'Method not allowed' });
  }
} 