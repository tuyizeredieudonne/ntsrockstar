import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import HomeUpdate from '@/models/HomeUpdate';

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
        const { title, content, type, imageUrl, videoUrl, isPublished } = req.body;

        // Validate required fields
        if (!title || !content || !type) {
          return res.status(400).json({
            success: false,
            message: 'Title, content, and type are required',
          });
        }

        // Type-specific validation
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

        const homeUpdate = await HomeUpdate.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        ).select('-__v');

        if (!homeUpdate) {
          return res.status(404).json({
            success: false,
            message: 'Home update not found',
          });
        }

        return res.status(200).json({
          success: true,
          data: homeUpdate,
        });
      } catch (error) {
        console.error('Error updating home update:', error);
        return res.status(500).json({
          success: false,
          message: 'Error updating home update',
        });
      }

    case 'DELETE':
      try {
        const homeUpdate = await HomeUpdate.findByIdAndDelete(id);

        if (!homeUpdate) {
          return res.status(404).json({
            success: false,
            message: 'Home update not found',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Home update deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting home update:', error);
        return res.status(500).json({
          success: false,
          message: 'Error deleting home update',
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
  }
} 