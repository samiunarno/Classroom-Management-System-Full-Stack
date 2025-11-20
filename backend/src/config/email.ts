import nodemailer from "nodemailer";


// Create and return a nodemailer transporter
export const createTransporter = () => {
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
throw new Error("SMTP environment variables are missing.");
}


const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT) || 587,
secure: false,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});


return transporter;
};