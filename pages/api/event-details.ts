import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import EventDetails from '@/models/EventDetails';
import TicketType from '@/models/TicketType';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    await dbConnect();
    // Get event details
    const eventDetails = await EventDetails.findOne();

    if (!eventDetails) {
      return res.status(404).json({
        success: false,
        message: 'Event details not found'
      });
    }

    // Get all active ticket types
    const ticketTypes = await TicketType.find({ isActive: true }).sort({ price: 1 });

    // Combine event details with ticket types
    const responseData = {
      ...eventDetails.toObject(),
      ticketTypes: ticketTypes.map(type => ({
        _id: type._id,
        name: type.name,
        price: type.price,
        discountPrice: type.discountPrice,
        description: type.description,
        features: type.features,
        discountEndTime: type.discountEndTime
      }))
    };

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching event details'
    });
  }
} 