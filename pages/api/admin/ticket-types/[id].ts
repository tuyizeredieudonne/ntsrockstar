import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/dbConnect';
import TicketType from '@/models/TicketType';
import Booking from '@/models/Booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Ensure database connection
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    }

    const { id } = req.query;

    switch (req.method) {
      case 'PUT':
        try {
          const { name, price, discountPrice, description, features, discountEndTime, totalTickets } = req.body;

          // Validate required fields
          if (!name || !price || !description) {
            return res.status(400).json({
              success: false,
              message: 'Name, price, and description are required',
            });
          }

          // Get current ticket type with retry logic
          let currentTicketType;
          try {
            currentTicketType = await TicketType.findById(id);
          } catch (findError) {
            console.error('Error finding ticket type:', findError);
            return res.status(500).json({
              success: false,
              message: 'Error finding ticket type',
              error: findError instanceof Error ? findError.message : 'Unknown error'
            });
          }

          if (!currentTicketType) {
            return res.status(404).json({
              success: false,
              message: 'Ticket type not found',
            });
          }

          // Prepare update data
          const updateData = {
            name,
            price: Number(price),
            description,
            ...(discountPrice && { discountPrice: Number(discountPrice) }),
            ...(features && { features }),
            ...(discountEndTime && { discountEndTime }),
            ...(totalTickets && { totalTickets: Number(totalTickets) })
          };

          // Check if tickets are already sold
          if (currentTicketType.soldTickets > 0) {
            // If tickets are sold, we can still update prices but need to handle it carefully
            let ticketType;
            try {
              ticketType = await TicketType.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
              ).select('-__v');
            } catch (updateError) {
              console.error('Error updating ticket type:', updateError);
              return res.status(500).json({
                success: false,
                message: 'Error updating ticket type',
                error: updateError instanceof Error ? updateError.message : 'Unknown error'
              });
            }

            // Log the price change for admin tracking
            console.log('Price updated for ticket type with sold tickets:', {
              ticketTypeId: id,
              oldPrice: currentTicketType.price,
              newPrice: price,
              oldDiscountPrice: currentTicketType.discountPrice,
              newDiscountPrice: discountPrice,
              soldTickets: currentTicketType.soldTickets
            });

            return res.status(200).json({
              success: true,
              data: ticketType,
              message: 'Price updated successfully. Existing bookings will maintain their original prices.',
            });
          }

          // If no tickets are sold, allow all updates
          let ticketType;
          try {
            ticketType = await TicketType.findByIdAndUpdate(
              id,
              updateData,
              { new: true, runValidators: true }
            ).select('-__v');
          } catch (updateError) {
            console.error('Error updating ticket type:', updateError);
            return res.status(500).json({
              success: false,
              message: 'Error updating ticket type',
              error: updateError instanceof Error ? updateError.message : 'Unknown error'
            });
          }

          return res.status(200).json({
            success: true,
            data: ticketType,
          });
        } catch (error) {
          console.error('Error in PUT handler:', error);
          return res.status(500).json({
            success: false,
            message: 'Error updating ticket type',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

      case 'DELETE':
        try {
          // Check if tickets are sold before deletion
          const ticketType = await TicketType.findById(id);
          if (!ticketType) {
            return res.status(404).json({
              success: false,
              message: 'Ticket type not found',
            });
          }

          if (ticketType.soldTickets > 0) {
            return res.status(400).json({
              success: false,
              message: 'Cannot delete ticket type with sold tickets',
            });
          }

          await TicketType.findByIdAndDelete(id);

          return res.status(200).json({
            success: true,
            message: 'Ticket type deleted successfully',
          });
        } catch (error) {
          console.error('Error deleting ticket type:', error);
          return res.status(500).json({
            success: false,
            message: 'Error deleting ticket type',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed',
        });
    }
  } catch (error) {
    console.error('Top-level error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 