import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Mock data for now - replace with actual database query later
    const homeUpdates = [
      {
        _id: '1',
        title: 'Early Bird Tickets Available!',
        content: 'Get your tickets now at a special early bird price. Limited time offer!',
        type: 'announcement',
        isPublished: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        title: 'New Artist Announcement',
        content: 'We are excited to announce that ZEO TRAP & DIEZ DOLLA will be performing at the event!',
        type: 'news',
        isPublished: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '3',
        title: 'Event Preview',
        content: 'Check out this amazing preview of what to expect at the event!',
        type: 'video',
        videoUrl: 'https://m.youtube.com/watch?v=LvFM2Ftloj4&pp=ygUUemVvIHRyYXAgcGVyZm9ybWFuY2U%3D',
        isPublished: true,
        createdAt: new Date().toISOString(),
      }
    ];

    return res.status(200).json({
      success: true,
      data: homeUpdates
    });
  } catch (error) {
    console.error('Error fetching home updates:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
} 
