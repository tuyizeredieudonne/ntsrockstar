import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Artist from '@/models/Artist';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await dbConnect();

    // Fetch all statistics in parallel
    const [totalUsers, totalBookings, totalArtists] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Artist.countDocuments(),
    ]);

    // Calculate total revenue from bookings
    const bookings = await Booking.find({ status: 'approved' });
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        totalArtists,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
    });
  }
} 