import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import TicketType from '@/models/TicketType';
import { sendEmail, generateBookingConfirmationEmail } from '@/lib/email';

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
          .populate('user', 'email fullName')
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

        // Get the current booking with populated user data
        const booking = await Booking.findById(id)
          .populate('ticketType')
          .populate('user', 'email fullName');

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
          ticketType.soldTickets += booking.quantity;
          await ticketType.save();

          // Send confirmation email
          const { subject, html } = generateBookingConfirmationEmail(booking);
          await sendEmail({
            to: booking.user.email,
            subject,
            html,
          });
        } else if (status === 'cancelled' && booking.status === 'confirmed') {
          // Refund the sold ticket count
          ticketType.soldTickets = Math.max(0, ticketType.soldTickets - booking.quantity);
          await ticketType.save();
        }

        // Update booking status
        const updatedBooking = await Booking.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        ).populate([
          { path: 'user', select: 'email fullName' },
          { path: 'ticketType', select: 'name price soldTickets totalTickets' }
        ]);

        return res.status(200).json({
          success: true,
          data: updatedBooking,
        });
      } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(400).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Error updating booking' 
        });
      }

    case 'DELETE':
      try {
        const booking = await Booking.findById(id).populate('ticketType');
        
        if (!booking) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found',
          });
        }

        // If the booking was confirmed, refund the ticket count
        if (booking.status === 'confirmed') {
          const ticketType = await TicketType.findById(booking.ticketType);
          if (ticketType) {
            ticketType.soldTickets = Math.max(0, ticketType.soldTickets - booking.quantity);
            await ticketType.save();
          }
        }

        await booking.deleteOne();

        return res.status(200).json({
          success: true,
          message: 'Booking deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting booking:', error);
        return res.status(400).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Error deleting booking' 
        });
      }

    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
} 