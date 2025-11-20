/* eslint-disable @typescript-eslint/no-unused-vars */
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

// Create and return Nodemailer transporter
export const createTransporter = () => {
  const options: SMTPTransport.Options = {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    connectionTimeout: 10000,
  };

  const transporter = nodemailer.createTransport(options);

  // Test the SMTP connection
  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP connection test failed:", error);
    } else {
      console.log("SMTP connection test successful");
    }
  });

  // Debug logs
  console.log("Created transporter with host:", process.env.SMTP_HOST);
  console.log("Using port:", process.env.SMTP_PORT);

  return transporter;
};


// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();

// // Create and return the nodemailer transporter
// export const createTransporter = () => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,  // Use the correct SMTP host
//     port: parseInt(process.env.SMTP_PORT || '587'),
//     secure: false,  // false for STARTTLS, true for SSL/TLS
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,  // Ensure you're using an app password if needed
//     },
//     timeout: 10000,  // Set the connection timeout to 10 seconds
//   });

//   // Test the SMTP connection immediately
//   transporter.verify((error, success) => {
//     if (error) {
//       console.error('SMTP connection test failed:', error);
//     } else {
//       console.log('SMTP connection test successful');
//     }
//   });

//   // Log the transporter settings for debugging purposes
//   console.log('Created transporter with host:', process.env.SMTP_HOST);
//   console.log('Using port:', process.env.SMTP_PORT);

//   return transporter;
// };
