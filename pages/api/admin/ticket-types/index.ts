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

  switch (req.method) {
    case 'GET':
      try {
        const ticketTypes = await TicketType.find()
          .sort({ createdAt: -1 })
          .select('-__v');

        return res.status(200).json({
          success: true,
          data: ticketTypes,
        });
      } catch (error) {
        console.error('Error fetching ticket types:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching ticket types',
        });
      }

    case 'POST':
      try {
        const { name, price, discountPrice, description, features, discountEndTime } = req.body;

        // Validate required fields
        if (!name || !price || !description) {
          return res.status(400).json({
            success: false,
            message: 'Name, price, and description are required',
          });
        }

        const ticketType = await TicketType.create({
          name,
          price,
          discountPrice,
          description,
          features,
          discountEndTime,
        });

        return res.status(201).json({
          success: true,
          data: ticketType,
        });
      } catch (error) {
        console.error('Error creating ticket type:', error);
        return res.status(400).json({
          success: false,
          message: 'Error creating ticket type',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 