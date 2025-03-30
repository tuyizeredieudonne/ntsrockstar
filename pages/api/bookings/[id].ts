import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import TicketType from '@/models/TicketType';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const booking = await Booking.findById(id)
          .populate('ticketType')
          .select('-__v');
        
        if (!booking) {
          return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        return res.status(200).json({ success: true, data: booking });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    case 'PUT':
      try {
        const { status } = req.body;

        // Get the current booking
        const booking = await Booking.findById(id);
        if (!booking) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found',
          });
        }

        // Get the ticket type
        const ticketType = await TicketType.findById(booking.ticketType);
        if (!ticketType) {
          return res.status(404).json({
            success: false,
            message: 'Ticket type not found',
          });
        }

        // Handle status changes
        if (status === 'confirmed' && booking.status === 'pending') {
          // Check if tickets are still available
          if (ticketType.isSoldOut) {
            return res.status(400).json({
              success: false,
              message: 'Cannot confirm booking: tickets are sold out',
            });
          }

          // Update sold tickets count
          ticketType.soldTickets += 1;
          await ticketType.save();
        } else if (status === 'cancelled' && booking.status === 'confirmed') {
          // Refund the sold ticket count
          ticketType.soldTickets = Math.max(0, ticketType.soldTickets - 1);
          await ticketType.save();
        }

        // Update booking status
        const updatedBooking = await Booking.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        ).populate([
          { path: 'user', select: 'name email' },
          { path: 'event', select: 'title date venue' },
          { path: 'ticketType', select: 'name price' }
        ]);

        return res.status(200).json({
          success: true,
          data: updatedBooking,
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
        const deletedBooking = await Booking.deleteOne({ _id: id });
        
        if (!deletedBooking) {
          return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        return res.status(200).json({ success: true, data: {} });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 