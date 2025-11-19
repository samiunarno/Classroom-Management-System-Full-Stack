import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create and return the nodemailer transporter
export const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,  // Use the correct SMTP host
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,  // false for STARTTLS, true for SSL/TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,  // Ensure you're using an app password if needed
    },
    timeout: 10000,  // Set the connection timeout to 10 seconds
  });

  // Test the SMTP connection immediately
  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection test failed:', error);
    } else {
      console.log('SMTP connection test successful');
    }
  });

  // Log the transporter settings for debugging purposes
  console.log('Created transporter with host:', process.env.SMTP_HOST);
  console.log('Using port:', process.env.SMTP_PORT);
  console.log("SMTP User : ",process.env.SMTP_USER);

  return transporter;
};
const sendTestEmail = async () => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_USER,  // Sender's email (should match the SMTP_USER)
    to: '2021337@iub.edu.bd',      // A test recipient
    subject: 'Test Email',       // Email subject
    text: 'This is a test email to verify SMTP connection.', // Plain text body
  };

  // Send the test email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

// Call the function to send a test email
sendTestEmail();
