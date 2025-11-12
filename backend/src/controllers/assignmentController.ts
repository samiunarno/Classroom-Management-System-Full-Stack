import { Request, Response } from 'express';
import Joi from 'joi';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import { AuthRequest } from '../middleware/auth.js';

const assignmentSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  deadline: Joi.date().iso().required()
});

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = assignmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, deadline } = value;

    // Check if deadline is in the future
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ message: 'Deadline must be in the future' });
    }

    const assignment = new Assignment({
      title,
      description,
      deadline,
      createdBy: req.user!._id
    });

    await assignment.save();
    await assignment.populate('createdBy', 'name email');

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // If student, include submission status
    if (req.user?.role === 'student') {
      const assignmentsWithStatus = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await Submission.findOne({
            assignmentId: assignment._id,
            studentId: req.user!._id
          });

          return {
            ...assignment.toJSON(),
            hasSubmitted: !!submission,
            submissionDate: submission?.uploadedAt
          };
        })
      );

      return res.json(assignmentsWithStatus);
    }

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = assignmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, deadline } = value;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is admin or the creator
    if (req.user?.role !== 'admin' && assignment.createdBy.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, deadline },
      { new: true }
    ).populate('createdBy', 'name email');

    res.json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is admin or the creator
    if (req.user?.role !== 'admin' && assignment.createdBy.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    // Also delete all submissions for this assignment
    await Submission.deleteMany({ assignmentId: req.params.id });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMonitorStats = async (req: AuthRequest, res: Response) => {
  try {
    const assignmentsCreated = await Assignment.countDocuments({ createdBy: req.user!._id });
    const totalSubmissions = await Submission.countDocuments();
    
    const upcomingAssignments = await Assignment.find({
      deadline: { $gt: new Date() }
    }).sort({ deadline: 1 }).limit(5);

    res.json({
      assignmentsCreated,
      totalSubmissions,
      upcomingDeadlines: upcomingAssignments.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalAssignments = await Assignment.countDocuments();
    const submittedAssignments = await Submission.countDocuments({ studentId: req.user!._id });
    
    const nextAssignment = await Assignment.findOne({
      deadline: { $gt: new Date() }
    }).sort({ deadline: 1 });

    res.json({
      assignmentsAvailable: totalAssignments,
      submitted: submittedAssignments,
      pending: totalAssignments - submittedAssignments,
      nextDeadline: nextAssignment?.deadline || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};