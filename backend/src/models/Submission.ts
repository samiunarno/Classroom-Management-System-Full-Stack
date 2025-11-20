// src/models/Submission.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  assignmentId: Schema.Types.ObjectId;
  studentId: Schema.Types.ObjectId;
  filename: string;
  emailMessageId?: string;
  dropboxLink?: string;
  dropboxDirectLink?: string;
  uploadedAt: Date;
}

const submissionSchema = new Schema<ISubmission>({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  emailMessageId: { type: String },
  dropboxLink: { type: String },
  dropboxDirectLink: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

// // Ensure one submission per student per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<ISubmission>("Submission", submissionSchema);

// import mongoose, { Document, Schema } from 'mongoose';

// export interface ISubmission extends Document {
//   assignmentId: mongoose.Types.ObjectId;
//   studentId: mongoose.Types.ObjectId;
//   filename: string;
//   emailMessageId: string;
//   uploadedAt: Date;
// }

// const submissionSchema = new Schema<ISubmission>({
//   assignmentId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Assignment',
//     required: true,
//   },
//   studentId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   filename: {
//     type: String,
//     required: true,
//   },
//   emailMessageId: {
//     type: String,
//     required: true,
//   },
//   uploadedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Ensure one submission per student per assignment
// submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

// export default mongoose.model<ISubmission>('Submission', submissionSchema);
