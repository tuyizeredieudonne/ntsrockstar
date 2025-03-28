import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Artist from '@/models/Artist';
import { IArtist } from '@/types';

type ResponseData = {
  success: boolean;
  data?: IArtist[];
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    await dbConnect();

    // Get optional query param for featured only
    const { featured } = req.query;
    const query = featured === 'true' ? { featured: true } : {};

    const artists = await Artist.find(query)
      .sort({ name: 1 })
      .select('-__v')
      .lean();

    if (!artists.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No artists found'
      });
    }

    return res.status(200).json({
      success: true,
      data: artists
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching artists'
    });
  }
} 