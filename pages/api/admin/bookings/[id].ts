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

  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status',
          });
        }

        const booking = await Booking.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        ).select('-__v');

        if (!booking) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found',
          });
        }

        return res.status(200).json({
          success: true,
          data: booking,
        });
      } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({
          success: false,
          message: 'Error updating booking',
        });
      }

    case 'DELETE':
      try {
        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Booking deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting booking:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting booking',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 