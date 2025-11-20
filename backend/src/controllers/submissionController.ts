// src/controllers/submissionController.ts
import { Request, Response } from "express";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import { AuthRequest } from "../middleware/auth.js";
import { validatePdfFile } from "../utils/validateFile.js";
import { isDeadlinePassed } from "../utils/validateDeadline.js";
import { sendSubmissionEmail } from "../services/emailService.js";
import { uploadToDropbox } from "../services/dropboxService.js";
import { TextDecoder } from "util";

// 🔥 Fix mojibake from multer
const decodeFilename = (name: string) => {
  const bytes = Buffer.from(name, "binary");
  return new TextDecoder("utf-8").decode(bytes);
};

export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const decodedName = decodeFilename(file.originalname)
      .trim()
      .normalize("NFKC");
    file.originalname = decodedName;

    const fileValidation = validatePdfFile(file);
    if (!fileValidation.valid)
      return res.status(400).json({ message: fileValidation.error });

    const assignment = await Assignment.findById(id);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    if (isDeadlinePassed(assignment.deadline)) {
      return res
        .status(400)
        .json({ message: "Submission deadline has passed" });
    }

    const existingSubmission = await Submission.findOne({
      assignmentId: id,
      studentId: req.user!._id,
    });
    if (existingSubmission)
      return res.status(400).json({ message: "Assignment already submitted" });

    // -----------------------------
    // 🔥 Upload to Dropbox
    // -----------------------------
    const dropboxResult = await uploadToDropbox(file);

    // -----------------------------
    // 🔥 Send email (optional)
    // -----------------------------
    let emailMessageId: string | null = null;
    try {
      emailMessageId = await sendSubmissionEmail(
        req.user!.name,
        assignment.title,
        file.originalname,
        file.buffer
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    // -----------------------------
    // 🔥 Save submission with Dropbox links
    // -----------------------------
    const submission = new Submission({
      assignmentId: id,
      studentId: req.user!._id,
      filename: file.originalname,
      emailMessageId,
      dropboxLink: dropboxResult.sharedLink,
      dropboxDirectLink: dropboxResult.directLink,
    });

    await submission.save();

    res.status(201).json({
      message: "Assignment submitted successfully",
      submission: {
        id: submission._id,
        filename: submission.filename,
        uploadedAt: submission.uploadedAt,
        dropboxLink: submission.dropboxLink,
        dropboxDirectLink: submission.dropboxDirectLink,
      },
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------------------
// ❗ Below sections unchanged (you asked to update ONLY this file)
// ------------------------------------------------------------

export const getAssignmentSubmissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submissions = await Submission.find({ assignmentId: id })
      .populate("studentId", "name email")
      .populate("assignmentId", "title")
      .sort({ uploadedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find()
      .populate("studentId", "name email")
      .populate("assignmentId", "title")
      .sort({ uploadedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// import { Request, Response } from 'express';
// import Assignment from '../models/Assignment.js';
// import Submission from '../models/Submission.js';
// import { AuthRequest } from '../middleware/auth.js';
// import { validatePdfFile } from '../utils/validateFile.js';
// import { isDeadlinePassed } from '../utils/validateDeadline.js';
// import { sendSubmissionEmail } from '../services/emailService.js';
// import { TextDecoder } from 'util';

// // 🔥 Fix mojibake from multer
// const decodeFilename = (name: string) => {
//   const bytes = Buffer.from(name, 'binary');  // Interpret raw bytes
//   return new TextDecoder('utf-8').decode(bytes); // Convert to UTF-8
// // };

// export const submitAssignment = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     // -----------------------------
//     // 🔥 NEW DEBUG LOGS + FIX
//     // -----------------------------
//     console.log("🔥 RAW RECEIVED NAME:", file.originalname);
//     console.log("🔥 RAW BYTES:", Buffer.from(file.originalname));

//     const decodedName = decodeFilename(file.originalname)
//       .trim()
//       .normalize("NFKC");

//     console.log("🔥 DECODED NAME:", decodedName);

//     // Replace multer name with decoded UTF-8 name
//     file.originalname = decodedName;
//     // -----------------------------

//     // Validate file (now using corrected filename)
//     const fileValidation = validatePdfFile(file);
//     if (!fileValidation.valid) {
//       return res.status(400).json({ message: fileValidation.error });
//     }

//     // Check assignment exists
//     const assignment = await Assignment.findById(id);
//     if (!assignment) {
//       return res.status(404).json({ message: 'Assignment not found' });
//     }

//     // Deadline check
//     if (isDeadlinePassed(assignment.deadline)) {
//       return res.status(400).json({ message: 'Submission deadline has passed' });
//     }

//     // Check if user already submitted
//     const existingSubmission = await Submission.findOne({
//       assignmentId: id,
//       studentId: req.user!._id
//     });

//     if (existingSubmission) {
//       return res.status(400).json({ message: 'Assignment already submitted' });
//     }

//     try {
//       // Email PDF
//       const emailMessageId = await sendSubmissionEmail(
//         req.user!.name,
//         assignment.title,
//         file.originalname,
//         file.buffer
//       );

//       // Save submission
//       const submission = new Submission({
//         assignmentId: id,
//         studentId: req.user!._id,
//         filename: file.originalname,
//         emailMessageId
//       });

//       await submission.save();

//       res.status(201).json({
//         message: 'Assignment submitted successfully',
//         submission: {
//           id: submission._id,
//           filename: submission.filename,
//           uploadedAt: submission.uploadedAt
//         }
//       });

//     } catch (emailError) {
//       console.error('Email sending failed:', emailError);
//       return res.status(500).json({ message: 'Failed to send submission email' });
//     }

//   } catch (error) {
//     console.error('Submission error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // ------------------------------------------------------------
// // ❗ Below sections unchanged (you asked to update ONLY this file)
// // ------------------------------------------------------------

// export const getAssignmentSubmissions = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const submissions = await Submission.find({ assignmentId: id })
//       .populate('studentId', 'name email')
//       .populate('assignmentId', 'title')
//       .sort({ uploadedAt: -1 });

//     res.json(submissions);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const getAllSubmissions = async (req: Request, res: Response) => {
//   try {
//     const submissions = await Submission.find()
//       .populate('studentId', 'name email')
//       .populate('assignmentId', 'title')
//       .sort({ uploadedAt: -1 });

//     res.json(submissions);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };
