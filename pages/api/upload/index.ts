import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, // 2 minutes timeout
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get the base64 image data from the request body
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image data provided' 
      });
    }

    // Upload to Cloudinary with optimized settings
    const uploadResponse = await cloudinary.uploader.upload(data, {
      folder: 'nts_rockstar_party/payment_screenshots',
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      chunk_size: 6000000, // 6MB chunks
      eager: [
        { width: 800, height: 600, crop: 'limit' }, // Optimize image size
        { quality: 'auto' } // Automatic quality optimization
      ]
    });

    return res.status(200).json({
      success: true,
      url: uploadResponse.secure_url
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 