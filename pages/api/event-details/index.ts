import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import EventDetails from '@/models/EventDetails';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    const { method } = req;

    switch (method) {
      case 'GET':
        try {
          const eventDetails = await EventDetails.findOne();
          
          if (!eventDetails) {
            // Create default event details if none exist
            const newEventDetails = await EventDetails.create({
              name: 'NTS Rockstar Party',
              date: new Date(),
              endTime: new Date(),
              location: 'Nyanza TSS',
              description: 'Join us for an amazing event!',
              image: '/images/rock1.png',
              ticketPrice: 1000,
              discountPrice: 800,
              discountEndTime: new Date(),
              momoCode: '078XXXXXXX',
              momoInstructions: 'Pay using MTN Mobile Money to the number above and keep your transaction ID for verification.',
            });
            return res.status(200).json({ success: true, data: newEventDetails });
          }
          
          return res.status(200).json({ success: true, data: eventDetails });
        } catch (error) {
          console.error('Error in GET /api/event-details:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Error fetching event details',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

      case 'PUT':
        try {
          const session = await getServerSession(req, res, authOptions);

          if (!session || session.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
          }

          let eventDetails = await EventDetails.findOne();
          
          if (!eventDetails) {
            // Create event details if none exist
            eventDetails = await EventDetails.create(req.body);
          } else {
            // Update existing event details
            eventDetails = await EventDetails.findByIdAndUpdate(
              eventDetails._id,
              req.body,
              { new: true, runValidators: true }
            );
          }
          
          return res.status(200).json({ success: true, data: eventDetails });
        } catch (error) {
          console.error('Error in PUT /api/event-details:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Error updating event details',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in /api/event-details:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 