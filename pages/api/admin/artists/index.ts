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

  switch (req.method) {
    case 'GET':
      try {
        const artists = await Artist.find()
          .sort({ createdAt: -1 })
          .select('-__v');

        return res.status(200).json({
          success: true,
          data: artists,
        });
      } catch (error) {
        console.error('Error fetching artists:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching artists',
        });
      }

    case 'POST':
      try {
        const artist = await Artist.create(req.body);
        return res.status(201).json({
          success: true,
          data: artist,
        });
      } catch (error) {
        console.error('Error creating artist:', error);
        return res.status(400).json({
          success: false,
          message: 'Error creating artist',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 