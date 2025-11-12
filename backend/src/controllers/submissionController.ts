import { Request, Response } from 'express';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import { AuthRequest } from '../middleware/auth.js';
import { validatePdfFile } from '../utils/validateFile.js';
import { isDeadlinePassed } from '../utils/validateDeadline.js';
import { sendSubmissionEmail } from '../services/emailService.js';

export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file
    const fileValidation = validatePdfFile(file);
    if (!fileValidation.valid) {
      return res.status(400).json({ message: fileValidation.error });
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check deadline
    if (isDeadlinePassed(assignment.deadline)) {
      return res.status(400).json({ message: 'Submission deadline has passed' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId: id,
      studentId: req.user!._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    try {
      // Send email with PDF attachment
      const emailMessageId = await sendSubmissionEmail(
        req.user!.name,
        assignment.title,
        file.originalname,
        file.buffer
      );

      // Save submission record
      const submission = new Submission({
        assignmentId: id,
        studentId: req.user!._id,
        filename: file.originalname,
        emailMessageId
      });

      await submission.save();

      res.status(201).json({
        message: 'Assignment submitted successfully',
        submission: {
          id: submission._id,
          filename: submission.filename,
          uploadedAt: submission.uploadedAt
        }
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ message: 'Failed to send submission email' });
    }
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAssignmentSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submissions = await Submission.find({ assignmentId: id })
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title')
      .sort({ uploadedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find()
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title')
      .sort({ uploadedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};