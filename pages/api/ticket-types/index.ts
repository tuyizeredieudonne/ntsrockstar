import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/dbConnect';
import TicketType from '@/models/TicketType';

interface TicketData {
  name: string;
  price: number;
  description: string;
  features: string[];
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  isSoldOut?: boolean;
  isActive?: boolean;
  discountPrice?: number;
  discountEndTime?: Date;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await dbConnect();

    switch (req.method) {
      case 'POST':
        try {
          const { name, price, description, features, discountPrice, discountEndTime, totalTickets } = req.body;

          // Validate required fields
          if (!name || !price || !description) {
            return res.status(400).json({
              success: false,
              message: 'Name, price, and description are required',
            });
          }

          // Create ticket type with base data
          const ticketData: TicketData = {
            name,
            price: Number(price),
            description,
            features: features || [],
            totalTickets: totalTickets ? Number(totalTickets) : 100,
            soldTickets: 0,
            availableTickets: totalTickets ? Number(totalTickets) : 100
          };

          // Add discount fields if both are provided
          if (discountPrice && discountEndTime) {
            ticketData.discountPrice = Number(discountPrice);
            ticketData.discountEndTime = new Date(discountEndTime);
          }

          // Create ticket type
          const ticketType = await TicketType.create(ticketData);

          return res.status(201).json({
            success: true,
            data: ticketType,
          });
        } catch (error) {
          console.error('Error creating ticket type:', error);
          return res.status(500).json({
            success: false,
            message: 'Error creating ticket type',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

      case 'GET':
        try {
          const ticketTypes = await TicketType.find().select('-__v');
          return res.status(200).json({
            success: true,
            data: ticketTypes,
          });
        } catch (error) {
          console.error('Error fetching ticket types:', error);
          return res.status(500).json({
            success: false,
            message: 'Error fetching ticket types',
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
};

export default handler; 