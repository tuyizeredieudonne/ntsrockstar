import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import nodemailer from 'nodemailer';

// Function to send email notification
async function sendEmailNotification(email: string, subject: string, message: string) {
  try {
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Replace with your SMTP server
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD // Your email password or app-specific password
      }
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>') // Convert newlines to HTML line breaks
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    await dbConnect();

    switch (req.method) {
      case 'PUT':
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status'
          });
        }

        // Get the current booking with user details
        const currentBooking = await Booking.findById(id).populate('user');
        
        if (!currentBooking) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found'
          });
        }

        // Update the booking status
        const updatedBooking = await Booking.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        ).populate('user');

        // Send email notification based on status change
        if (status === 'approved' && currentBooking.status === 'pending') {
          const subject = 'Booking Approved - Rock Ticket';
          const message = `Dear ${currentBooking.user?.fullName || 'Valued Customer'},

Your booking has been approved! You can now attend the event.

Booking Details:
- Event: ${currentBooking.event?.name || 'N/A'}
- Date: ${new Date(currentBooking.event?.date || '').toLocaleDateString()}
- Location: ${currentBooking.event?.location || 'N/A'}

Thank you for choosing our service. We look forward to seeing you at the event!

Best regards,
Rock Ticket Team`;

          await sendEmailNotification(
            currentBooking.user?.email || '',
            subject,
            message
          );
        } else if (status === 'rejected' && currentBooking.status === 'pending') {
          const subject = 'Booking Rejected - Rock Ticket';
          const message = `Dear ${currentBooking.user?.fullName || 'Valued Customer'},

We regret to inform you that your booking has been rejected.

Booking Details:
- Event: ${currentBooking.event?.name || 'N/A'}
- Date: ${new Date(currentBooking.event?.date || '').toLocaleDateString()}
- Location: ${currentBooking.event?.location || 'N/A'}

If you have any questions, please contact our support team.

Best regards,
Rock Ticket Team`;

          await sendEmailNotification(
            currentBooking.user?.email || '',
            subject,
            message
          );
        }

        return res.status(200).json({
          success: true,
          data: updatedBooking
        });

      case 'DELETE':
        const deletedBooking = await Booking.findByIdAndDelete(id);

        if (!deletedBooking) {
          return res.status(404).json({
            success: false,
            message: 'Booking not found'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Booking deleted successfully'
        });

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Error handling booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Error handling booking'
    });
  }
} 