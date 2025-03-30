import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import Booking from '../../../models/Booking';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import TicketType from '../../../models/TicketType';

// Extend the session type to include our custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure API to handle both JSON and form data
export const config = {
  api: {
    bodyParser: true,
  },
};

// Helper function to upload file to Cloudinary
async function uploadToCloudinary(file: Buffer, filename: string) {
  try {
    // Convert buffer to base64
    const base64Data = file.toString('base64');
    
    // Create the data URL with proper MIME type
    const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    
    // Upload to Cloudinary with minimal options
    const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
      folder: 'nts_rockstar_party/payment_screenshots',
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      invalidate: true
    });
    
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload payment screenshot');
  }
}

// Helper to process the multipart/form-data
async function parseMultipartForm(req: NextApiRequest) {
  return new Promise<any>((resolve, reject) => {
    let data: any = {};
    let buffer = Buffer.alloc(0);
    
    // Handle incoming data chunks
    req.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });
    
    req.on('end', async () => {
      try {
        // Log the raw buffer content for debugging
        console.log('Raw buffer content:', buffer.toString('utf8').substring(0, 500));
        
        // Convert buffer to string
        const content = buffer.toString('utf8');
        
        // Find the boundary from the content-type header
        const contentType = req.headers['content-type'];
        console.log('Content-Type:', contentType);
        
        let boundary = '';
        if (contentType && contentType.includes('boundary=')) {
          boundary = contentType.split('boundary=')[1];
        } else {
          // Fallback to finding boundary in content
          boundary = content.split('\n')[0].trim();
        }
        
        console.log('Found boundary:', boundary);
        
        // Split by boundary
        const parts = content.split(boundary);
        console.log('Number of parts:', parts.length);
        
        // Process each part
        for (const part of parts) {
          // Skip empty parts
          if (!part.trim()) continue;
          
          // Log the part content for debugging
          console.log('Processing part:', part.substring(0, 200));
          
          // Look for field names in the content-disposition header
          const headerMatch = part.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/);
          
          if (headerMatch) {
            const fieldName = headerMatch[1];
            const filename = headerMatch[2];
            
            console.log('Found field:', fieldName, 'with filename:', filename);
            
            // Find the value after the headers (separated by two newlines)
            const valueMatch = part.split(/\r\n\r\n|\n\n/);
            if (valueMatch && valueMatch.length > 1) {
              let fieldValue = valueMatch[1].trim();
              
              if (filename) {
                // This is a file upload
                // Remove any trailing newlines or whitespace
                fieldValue = fieldValue.replace(/\r?\n$/, '');
                const fileContent = Buffer.from(fieldValue, 'binary');
                try {
                  const fileUrl = await uploadToCloudinary(fileContent, filename);
                  data[fieldName] = fileUrl;
                  console.log(`File uploaded successfully for field: ${fieldName}`);
                } catch (uploadError) {
                  console.error('Error uploading file:', uploadError);
                  reject(new Error('Failed to upload payment screenshot'));
                }
              } else {
                // Regular field
                data[fieldName] = fieldValue;
                console.log(`Field ${fieldName} received: ${fieldValue}`);
              }
            }
          }
        }
        
        // Log all received data
        console.log('Received form data:', data);
          resolve(data);
      } catch (err) {
        console.error('Error parsing multipart form data:', err);
        reject(err);
      }
    });
    
    req.on('error', (err) => {
      console.error('Error in request:', err);
      reject(err);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // Log request headers for debugging
  console.log('Request headers:', req.headers);
  console.log('Request method:', method);

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || session.user.role !== 'admin') {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const bookings = await Booking.find({})
          .populate('user', 'fullName email phoneNumber studentLevel trade')
          .populate('event', 'name date location')
          .populate('ticketType', 'name price discountPrice description features')
          .sort({ createdAt: -1 });

        // Transform the data to match frontend interface and ensure no undefined values
        const transformedBookings = bookings.map(booking => ({
          _id: booking._id,
          fullName: booking.user?.fullName || 'N/A',
          email: booking.user?.email || 'N/A',
          phoneNumber: booking.user?.phoneNumber || 'N/A',
          studentLevel: booking.user?.studentLevel || 'N/A',
          trade: booking.user?.trade || 'N/A',
          event: {
            _id: booking.event?._id || 'N/A',
            name: booking.event?.name || 'N/A',
            date: booking.event?.date || new Date().toISOString(),
            location: booking.event?.location || 'N/A'
          },
          ticketType: {
            _id: booking.ticketType?._id || 'N/A',
            name: booking.ticketType?.name || 'N/A',
            price: booking.ticketType?.price || 0,
            discountPrice: booking.ticketType?.discountPrice || 0,
            description: booking.ticketType?.description || 'N/A',
            features: booking.ticketType?.features || []
          },
          quantity: booking.quantity || 1,
          totalAmount: booking.totalAmount || 0,
          status: booking.status || 'pending',
          momoTransactionId: booking.momoTransactionId || 'N/A',
          paymentScreenshot: booking.paymentScreenshot || 'N/A',
          createdAt: booking.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: booking.updatedAt?.toISOString() || new Date().toISOString(),
          // Add calculated fields with null checks
          discountApplied: (booking.ticketType?.price || 0) > (booking.ticketType?.discountPrice || 0),
          savings: (booking.ticketType?.price || 0) > (booking.ticketType?.discountPrice || 0)
            ? ((booking.ticketType?.price || 0) - (booking.ticketType?.discountPrice || 0)) * (booking.quantity || 1)
            : 0,
        }));

        return res.status(200).json({ 
          success: true, 
          data: transformedBookings,
          summary: {
            totalBookings: transformedBookings.length,
            totalRevenue: transformedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
            totalSavings: transformedBookings.reduce((sum, booking) => sum + (booking.savings || 0), 0),
            pendingBookings: transformedBookings.filter(b => b.status === 'pending').length,
            confirmedBookings: transformedBookings.filter(b => b.status === 'confirmed').length,
            cancelledBookings: transformedBookings.filter(b => b.status === 'cancelled').length,
          }
        });
      } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(400).json({ success: false, error: 'Error fetching bookings' });
      }
    case 'POST':
      try {
        // Check for user session
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get the user ID from the session
        const userId = session.user.id;

        let formData;
        const contentType = req.headers['content-type'];

        // Handle different content types
        if (contentType?.includes('application/json')) {
          // Handle JSON data
          formData = req.body;
          console.log('Received JSON data:', formData);
        } else if (contentType?.includes('multipart/form-data')) {
          // Handle multipart form data
          formData = await parseMultipartForm(req);
          console.log('Received form data:', formData);
        } else {
          return res.status(400).json({
            success: false,
            message: 'Unsupported content type. Please use application/json or multipart/form-data',
          });
        }

        // Get the request body from parsed form data
        const {
          event,
          ticketType,
          totalAmount,
          momoTransactionId,
          fullName,
          email,
          phoneNumber,
          studentLevel,
          trade,
          paymentScreenshot
        } = formData;

        // Log all required fields
        console.log('Required fields:', {
          event,
          ticketType,
          totalAmount,
          momoTransactionId,
          paymentScreenshot
        });

        // Validate required fields with detailed error message
        const missingFields = [];
        if (!event) missingFields.push('event');
        if (!ticketType) missingFields.push('ticketType');
        if (!totalAmount) missingFields.push('totalAmount');
        if (!momoTransactionId) missingFields.push('momoTransactionId');
        if (!paymentScreenshot) missingFields.push('paymentScreenshot');

        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`,
            receivedData: formData,
            headers: req.headers
          });
        }

        // Create booking
        const booking = await Booking.create({
          user: userId,
          event,
          ticketType,
          totalAmount: Number(totalAmount),
          pricePaid: Number(totalAmount),
          momoTransactionId,
          fullName,
          email,
          phoneNumber,
          studentLevel,
          trade,
          paymentScreenshot,
          status: 'pending'
        });

        // Populate the booking with related data
        const populatedBooking = await Booking.findById(booking._id)
          .populate('user', 'fullName email phoneNumber studentLevel trade')
          .populate('event', 'name date location')
          .populate('ticketType', 'name price discountPrice description features');

        return res.status(201).json({
          success: true,
          data: populatedBooking,
        });
      } catch (error) {
        console.error('Booking creation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating booking',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    default:
      return res.status(400).json({ success: false, message: 'Method not allowed' });
  }
} 