import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import TicketType from '@/models/TicketType';

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
        const { name, price, discountPrice, description, features, discountEndTime } = req.body;

        // Validate required fields
        if (!name || !price || !description) {
          return res.status(400).json({
            success: false,
            message: 'Name, price, and description are required',
          });
        }

        const ticketType = await TicketType.findByIdAndUpdate(
          id,
          {
            name,
            price,
            discountPrice,
            description,
            features,
            discountEndTime,
          },
          { new: true }
        ).select('-__v');

        if (!ticketType) {
          return res.status(404).json({
            success: false,
            message: 'Ticket type not found',
          });
        }

        return res.status(200).json({
          success: true,
          data: ticketType,
        });
      } catch (error) {
        console.error('Error updating ticket type:', error);
        return res.status(500).json({
          success: false,
          message: 'Error updating ticket type',
        });
      }

    case 'DELETE':
      try {
        const ticketType = await TicketType.findByIdAndDelete(id);

        if (!ticketType) {
          return res.status(404).json({
            success: false,
            message: 'Ticket type not found',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Ticket type deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting ticket type:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting ticket type',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 