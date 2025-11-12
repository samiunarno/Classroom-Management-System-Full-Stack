# MERN Assignment Management System - Setup Instructions

## Overview
This is a complete MERN (MongoDB, Express, React, Node.js) stack application for managing student assignments with email-based PDF submissions.

## Project Structure
```
project/
├── backend/          # Backend API (Node.js + Express + TypeScript)
├── src/             # Frontend (React + TypeScript + TailwindCSS)
├── package.json     # Frontend dependencies
└── README.md        # This file
```

## Prerequisites
- Node.js 18+ installed
- MongoDB instance (local or cloud)
- SMTP email service (Gmail, Mailtrap, etc.)

## Quick Setup

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
MONGO_URI=mongodb://localhost:27017/assignment-management
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES=24h
PORT=4000

# Email Configuration (Example with Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=monitor@yourdomain.com

NODE_ENV=development
```

### 2. Frontend Setup
```bash
# From project root
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Email Configuration Options

### Gmail (Recommended for testing)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Generate in Gmail App Passwords
```

### Mailtrap (For development)
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
```

### Other providers (SendGrid, Mailgun, etc.)
Configure according to your provider's SMTP settings.

## Default Admin Account

After first run, create an admin account:
1. Register a new account through the web interface
2. Directly update the user in MongoDB:
```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", approved: true } }
)
```

## User Roles & Permissions

### Admin
- Approve/reject user registrations
- Manage user roles
- View system statistics
- Access all features

### Monitor
- Create and manage assignments
- View all submissions
- Receive PDF submissions via email
- Monitor assignment statistics

### Student
- View available assignments
- Submit PDF assignments (Chinese filename required)
- Track submission status
- View personal statistics

## File Upload Requirements

PDF submissions must follow strict rules:
- **File type**: Only PDF files allowed
- **Filename**: Must contain only Chinese characters + .pdf extension
  - ✅ Valid: `王小明.pdf`, `张三.pdf`
  - ❌ Invalid: `assignment.pdf`, `王小明_作业1.pdf`, `WangXiaoming.pdf`

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Admin Routes
- `GET /api/users` - List all users
- `GET /api/users/pending` - List pending users
- `POST /api/users/:id/approve` - Approve user
- `PATCH /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment (Monitor/Admin)
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Submissions
- `POST /api/assignments/:id/submit` - Submit PDF (Student)
- `GET /api/assignments/:id/submissions` - View submissions (Monitor/Admin)

## Deployment

### Backend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Frontend (Vercel)
1. Update `VITE_API_BASE_URL` in production environment
2. Build and deploy to Vercel

## Security Features

- JWT authentication with token expiration
- Role-based access control
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- File type validation
- Filename validation with regex
- Helmet security headers
- Admin approval system

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify MONGO_URI is correct
   - Ensure network connectivity

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check email provider settings
   - For Gmail: Enable 2FA and use App Password

3. **File Upload Fails**
   - Ensure filename contains only Chinese characters
   - Check file is actually a PDF
   - Verify file size is under 10MB

4. **CORS Issues**
   - Update CORS origins in backend/src/app.ts
   - Ensure frontend URL matches allowed origins

### Development Tips

- Use MongoDB Compass for database management
- Test email with Mailtrap in development
- Check browser console and network tab for frontend issues
- Monitor backend logs for API errors

## Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use production MongoDB instance
- [ ] Configure production email service
- [ ] Update CORS origins for production
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging

## Support

If you encounter any issues:
1. Check the console logs (both frontend and backend)
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB connection and email configuration

## Tech Stack Summary

**Backend:**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer for emails
- Multer for file uploads (memory storage)
- Security: Helmet, CORS, Rate limiting

**Frontend:**
- React 18 + TypeScript
- TailwindCSS for styling
- Framer Motion for animations
- React Router for navigation
- Axios for API calls
- Vite for development