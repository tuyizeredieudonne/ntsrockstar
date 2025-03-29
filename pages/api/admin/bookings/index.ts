import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const bookings = await Booking.find()
          .populate('ticketType')
          .sort({ createdAt: -1 })
          .select('-__v');

        return res.status(200).json({
          success: true,
          data: bookings,
        });
      } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching bookings',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 