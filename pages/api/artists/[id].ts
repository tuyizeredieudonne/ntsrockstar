import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Artist from '@/models/Artist';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query: { id } } = req;

  await dbConnect();

  // Check admin authentication for all methods except GET
  if (method !== 'GET') {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  }

  switch (method) {
    case 'GET':
      try {
        const artist = await Artist.findById(id);
        
        if (!artist) {
          return res.status(404).json({ success: false, message: 'Artist not found' });
        }
        
        return res.status(200).json({ success: true, data: artist });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    case 'PUT':
      try {
        const artist = await Artist.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        
        if (!artist) {
          return res.status(404).json({ success: false, message: 'Artist not found' });
        }
        
        return res.status(200).json({ success: true, data: artist });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    case 'DELETE':
      try {
        const deletedArtist = await Artist.deleteOne({ _id: id });
        
        if (!deletedArtist) {
          return res.status(404).json({ success: false, message: 'Artist not found' });
        }
        
        return res.status(200).json({ success: true, data: {} });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(400).json({ success: false, message: 'Method not allowed' });
  }
} 