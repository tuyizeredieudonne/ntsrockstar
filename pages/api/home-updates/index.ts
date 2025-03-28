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
        const homeUpdates = await HomeUpdate.find({})
          .sort({ createdAt: -1 })
          .limit(6);
        res.status(200).json({ success: true, data: homeUpdates });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;

    case 'POST':
      // Only admin can post updates
      if (!session || session.user?.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      try {
        const homeUpdate = await HomeUpdate.create(req.body);
        res.status(201).json({ success: true, data: homeUpdate });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
} 