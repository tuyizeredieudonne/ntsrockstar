import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const generateBookingConfirmationEmail = (booking: any) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF6B6B; margin: 0;">NTS Rockstar Party</h1>
        <p style="color: #666; font-size: 18px;">Booking Confirmation</p>
      </div>

      <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333;">Dear ${booking.fullName},</p>
        
        <p style="color: #666; line-height: 1.6;">
          Your booking has been confirmed! We're excited to have you join us for an unforgettable night of music and entertainment.
        </p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h2 style="color: #FF6B6B; margin-top: 0;">Booking Details</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="margin: 5px 0;"><strong style="color: #444;">Ticket Type:</strong><br>${booking.ticketType.name}</p>
              <p style="margin: 5px 0;"><strong style="color: #444;">Quantity:</strong><br>${booking.quantity}</p>
              <p style="margin: 5px 0;"><strong style="color: #444;">Student Level:</strong><br>${booking.studentLevel}</p>
              <p style="margin: 5px 0;"><strong style="color: #444;">Trade:</strong><br>${booking.trade}</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong style="color: #444;">Total Amount:</strong><br>RF ${booking.totalAmount}</p>
              <p style="margin: 5px 0;"><strong style="color: #444;">Status:</strong><br>Confirmed</p>
              <p style="margin: 5px 0;"><strong style="color: #444;">Event Date:</strong><br>${new Date(booking.event.date).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong style="color: #444;">Location:</strong><br>${booking.event.location}</p>
            </div>
          </div>
        </div>

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #444; margin-top: 0;">Important Information</h3>
          <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Please keep this email for your records</li>
            <li>You may be required to show this confirmation at the event</li>
            <li>Arrive at least 30 minutes before the event starts</li>
            <li>Bring a valid ID for verification</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0;">Thank you for choosing NTS Rockstar Party!</p>
          <p style="color: #999; font-size: 14px; margin-top: 10px;">
            If you have any questions, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  `;

  return {
    subject: '🎉 Your NTS Rockstar Party Booking is Confirmed!',
    html,
  };
}; 