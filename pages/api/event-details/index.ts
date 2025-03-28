import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import EventDetails from '@/models/EventDetails';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const eventDetails = await EventDetails.findOne();
        
        if (!eventDetails) {
          // Create default event details if none exist
          const newEventDetails = await EventDetails.create({});
          return res.status(200).json({ success: true, data: newEventDetails });
        }
        
        return res.status(200).json({ success: true, data: eventDetails });
      } catch (error) {
        return res.status(400).json({ success: false, error });
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
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(400).json({ success: false, message: 'Method not allowed' });
  }
} 