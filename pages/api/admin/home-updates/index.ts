import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import HomeUpdate from '@/models/HomeUpdate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  // For GET requests, anyone can access
  if (req.method !== 'GET') {
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        // For non-admin users, only show published updates
        const filter = !session || session.user.role !== 'admin' ? { isPublished: true } : {};
        
        const homeUpdates = await HomeUpdate.find(filter)
          .sort({ createdAt: -1 })
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
        });
      }

    case 'POST':
      try {
        // Validate required fields based on type
        const { title, content, type, imageUrl, videoUrl } = req.body;

        if (!title || !content || !type) {
          return res.status(400).json({
            success: false,
            message: 'Title, content, and type are required',
          });
        }

        if (type === 'image' && !imageUrl) {
          return res.status(400).json({
            success: false,
            message: 'Image URL is required for image updates',
          });
        }

        if (type === 'video' && !videoUrl) {
          return res.status(400).json({
            success: false,
            message: 'Video URL is required for video updates',
          });
        }

        const homeUpdate = await HomeUpdate.create(req.body);
        
        return res.status(201).json({
          success: true,
          data: homeUpdate,
        });
      } catch (error) {
        console.error('Error creating home update:', error);
        return res.status(400).json({
          success: false,
          message: 'Error creating home update',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 