import { Request, Response } from 'express';
import Joi from 'joi';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import { AuthRequest } from '../middleware/auth.js';

const assignmentSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  deadline: Joi.date().iso().required(),
});

// Create a new assignment
export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = assignmentSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, deadline } = value;

    // Ensure the deadline is in the future
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ message: 'Deadline must be in the future' });
    }

    const assignment = new Assignment({
      title,
      description,
      deadline,
      createdBy: req.user!._id,
    });

    await assignment.save();
    await assignment.populate('createdBy', 'name email');

    console.log('Assignment created successfully:', assignment);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error during assignment creation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all assignments
export const getAllAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    if (req.user?.role === 'student') {
      const assignmentsWithStatus = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await Submission.findOne({
            assignmentId: assignment._id,
            studentId: req.user!._id,
          });

          return {
            ...assignment.toJSON(),
            hasSubmitted: !!submission,
            submissionDate: submission?.uploadedAt,
          };
        })
      );
      return res.json(assignmentsWithStatus);
    }

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assignment by ID
export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('createdBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an assignment
export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = assignmentSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
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
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an assignment
export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    // Check if the assignment exists
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is admin or the creator of the assignment
    if (req.user?.role !== 'monitor' && assignment.createdBy.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    // Delete the assignment
    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!deletedAssignment) {
      return res.status(500).json({ message: 'Failed to delete the assignment' });
    }

    // Delete all submissions for this assignment
    const deletedSubmissions = await Submission.deleteMany({ assignmentId: req.params.id });
    if (deletedSubmissions.deletedCount === 0) {
      console.log('No submissions found to delete for this assignment');
    }

    // Send success response
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error during assignment deletion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get monitor stats
export const getMonitorStats = async (req: AuthRequest, res: Response) => {
  try {
    const assignmentsCreated = await Assignment.countDocuments({ createdBy: req.user!._id });
    const totalSubmissions = await Submission.countDocuments();

    const upcomingAssignments = await Assignment.find({
      deadline: { $gt: new Date() },
    })
      .sort({ deadline: 1 })
      .limit(5);

    res.json({
      assignmentsCreated,
      totalSubmissions,
      upcomingDeadlines: upcomingAssignments.length,
    });
  } catch (error) {
    console.error('Error fetching monitor stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student stats
export const getStudentStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalAssignments = await Assignment.countDocuments();
    const submittedAssignments = await Submission.countDocuments({ studentId: req.user!._id });

    const nextAssignment = await Assignment.findOne({
      deadline: { $gt: new Date() },
    })
      .sort({ deadline: 1 });

    res.json({
      assignmentsAvailable: totalAssignments,
      submitted: submittedAssignments,
      pending: totalAssignments - submittedAssignments,
      nextDeadline: nextAssignment?.deadline || null,
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
