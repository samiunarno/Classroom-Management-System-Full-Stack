import { createTransporter } from '../config/email.js';

export const sendSubmissionEmail = async (
  studentName: string,
  assignmentTitle: string,
  filename: string,
  fileBuffer: Buffer
) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `New Assignment Submission: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Assignment Submission</h2>
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Assignment:</strong> ${assignmentTitle}</p>
        <p><strong>Filename:</strong> ${filename}</p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        <p>Please find the attached PDF submission.</p>
      </div>
    `,
    attachments: [
      {
        filename: filename,
        content: fileBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  const result = await transporter.sendMail(mailOptions);
  return result.messageId;
};