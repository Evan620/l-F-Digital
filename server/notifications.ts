
import nodemailer from 'nodemailer';

// Create a transporter (you'll need to add these to your environment variables)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Use Gmail App Password
  }
});

export const sendBookingNotification = async (bookingData: any) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.NOTIFICATION_EMAIL || 'your-business-email@example.com',
    subject: 'New Consultation Booking',
    html: `
      <h2>New Booking Request</h2>
      <p><strong>Name:</strong> ${bookingData.fullName}</p>
      <p><strong>Email:</strong> ${bookingData.email}</p>
      <p><strong>Company:</strong> ${bookingData.companyName}</p>
      <p><strong>Date:</strong> ${bookingData.date}</p>
      <p><strong>Time:</strong> ${bookingData.time}</p>
      <p><strong>Service:</strong> ${bookingData.serviceType}</p>
      ${bookingData.businessDescription ? `<p><strong>Business Description:</strong> ${bookingData.businessDescription}</p>` : ''}
    `
  };

  return transporter.sendMail(mailOptions);
};
