import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Check if user is authenticated and is admin
  const session = await getSession({ req });
  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized access' });
  }

  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to and message'
      });
    }

    // Here you would implement your local SMS sending logic
    // This could be:
    // 1. Using a USB modem/GSM module connected to your server
    // 2. Using your mobile carrier's SMS gateway
    // 3. Using a local SMS server
    
    // For demonstration, we'll just log the message
    console.log('Sending SMS:');
    console.log('To:', to);
    console.log('Message:', message);

    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res.status(200).json({
      success: true,
      message: 'SMS sent successfully'
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending SMS'
    });
  }
} 