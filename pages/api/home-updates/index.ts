import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import HomeUpdate from '../../../models/HomeUpdate';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        // For non-admin users, only show published updates
        const filter = !session || session.user?.role !== 'admin' ? { isPublished: true } : {};
        
        const homeUpdates = await HomeUpdate.find(filter)
          .sort({ createdAt: -1 })
          .limit(6) // Limit to 6 most recent updates
          .select('-__v');

        return res.status(200).json({
          success: true,
          data: homeUpdates,
        });
      } catch (error) {
        console.error('Error fetching home updates:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching home updates',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    case 'POST':
      // Only admin can post updates
      if (!session || session.user?.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      try {
        const homeUpdate = await HomeUpdate.create(req.body);
        return res.status(201).json({ success: true, data: homeUpdate });
      } catch (error) {
        console.error('Error creating home update:', error);
        return res.status(400).json({ 
          success: false, 
          message: 'Error creating home update',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
} 