import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import EventDetails from '../../../models/EventDetails';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const eventDetails = await EventDetails.findOne();
        if (!eventDetails) {
          return res.status(404).json({ success: false, message: 'Event details not found' });
        }
        return res.status(200).json({ success: true, data: eventDetails.ticketTypes });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching ticket types' });
      }

    case 'PUT':
      try {
        const { ticketTypes } = req.body;
        
        if (!Array.isArray(ticketTypes)) {
          return res.status(400).json({ success: false, message: 'Invalid ticket types data' });
        }

        const eventDetails = await EventDetails.findOne();
        if (!eventDetails) {
          return res.status(404).json({ success: false, message: 'Event details not found' });
        }

        eventDetails.ticketTypes = ticketTypes;
        await eventDetails.save();

        return res.status(200).json({ success: true, data: eventDetails.ticketTypes });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating ticket types' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
} 