import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated and is admin
  const session = await getSession({ req });
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    await dbConnect();

    // Fetch all bookings with populated user details
    const bookings = await Booking.find()
      .populate('user', 'fullName email phoneNumber studentLevel trade')
      .populate('event', 'name date location')
      .populate('ticketType', 'name price discountPrice description features')
      .sort({ createdAt: -1 });

    // Transform the data to include all necessary information
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      fullName: booking.user?.fullName || 'N/A',
      email: booking.user?.email || 'N/A',
      phoneNumber: booking.user?.phoneNumber || 'N/A',
      studentLevel: booking.user?.studentLevel || booking.studentLevel || 'N/A',
      trade: booking.user?.trade || booking.trade || 'N/A',
      event: {
        _id: booking.event?._id,
        name: booking.event?.name || 'N/A',
        date: booking.event?.date || 'N/A',
        location: booking.event?.location || 'N/A'
      },
      ticketType: {
        _id: booking.ticketType?._id,
        name: booking.ticketType?.name || 'N/A',
        price: booking.ticketType?.price || 0,
        discountPrice: booking.ticketType?.discountPrice || 0,
        description: booking.ticketType?.description || 'N/A',
        features: booking.ticketType?.features || []
      },
      quantity: booking.quantity || 1,
      totalAmount: booking.totalAmount || 0,
      momoTransactionId: booking.momoTransactionId || 'N/A',
      paymentScreenshot: booking.paymentScreenshot || null,
      status: booking.status || 'pending',
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      // Add calculated fields
      discountApplied: (booking.ticketType?.price || 0) > (booking.ticketType?.discountPrice || 0),
      savings: (booking.ticketType?.price || 0) > (booking.ticketType?.discountPrice || 0)
        ? ((booking.ticketType?.price || 0) - (booking.ticketType?.discountPrice || 0)) * (booking.quantity || 1)
        : 0
    }));

    return res.status(200).json({
      success: true,
      data: transformedBookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
} 