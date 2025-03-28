import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Artist from '@/models/Artist';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  await dbConnect();

  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      try {
        const artist = await Artist.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        ).select('-__v');

        if (!artist) {
          return res.status(404).json({
            success: false,
            message: 'Artist not found',
          });
        }

        return res.status(200).json({
          success: true,
          data: artist,
        });
      } catch (error) {
        console.error('Error updating artist:', error);
        return res.status(500).json({
          success: false,
          message: 'Error updating artist',
        });
      }

    case 'DELETE':
      try {
        const artist = await Artist.findByIdAndDelete(id);

        if (!artist) {
          return res.status(404).json({
            success: false,
            message: 'Artist not found',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Artist deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting artist:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting artist',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 