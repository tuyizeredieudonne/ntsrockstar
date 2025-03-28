import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // For admin-only uploads (like artist images), check for admin role
    if (req.body.requireAdmin) {
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    }

    const fileStr = req.body.data;
    
    if (!fileStr) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image data provided' 
      });
    }

    // Remove the data URL prefix if present
    const base64Data = fileStr.replace(/^data:image\/\w+;base64,/, '');

    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        folder: 'nts_rockstar_party',
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      }
    );

    return res.status(200).json({ 
      success: true, 
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Image upload failed' 
    });
  }
} 
 