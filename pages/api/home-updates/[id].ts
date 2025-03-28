import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import HomeUpdate from '../../../models/HomeUpdate';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const session = await getSession({ req });
  
  // Check if user is admin for protected operations
  if (req.method !== 'GET' && (!session || session.user?.role !== 'admin')) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const homeUpdate = await HomeUpdate.findById(id);
        if (!homeUpdate) {
          return res.status(404).json({ success: false, message: 'Home update not found' });
        }
        res.status(200).json({ success: true, data: homeUpdate });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;

    case 'PUT':
      try {
        const homeUpdate = await HomeUpdate.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!homeUpdate) {
          return res.status(404).json({ success: false, message: 'Home update not found' });
        }
        res.status(200).json({ success: true, data: homeUpdate });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;

    case 'DELETE':
      try {
        const deletedHomeUpdate = await HomeUpdate.findByIdAndDelete(id);
        if (!deletedHomeUpdate) {
          return res.status(404).json({ success: false, message: 'Home update not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
} 