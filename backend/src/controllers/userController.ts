/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

// ==================== GET ALL USERS ====================
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    console.error("🔥 Error in getAllUsers:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== GET PENDING USERS ====================
export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ approved: false })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error: any) {
    console.error("🔥 Error in getPendingUsers:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== APPROVE USER ====================
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("🟢 Approve request received for ID:", id);

    if (!id) {
      console.error("❌ No user ID provided in request params");
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      console.error("❌ User not found for ID:", id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("✅ User approved successfully:", user.email);
    res.json({ message: 'User approved successfully', user });
  } catch (error: any) {
    console.error("🔥 Error in approveUser:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== UPDATE USER ROLE ====================
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    console.log(`🟣 Update role request: id=${id}, role=${role}`);

    if (!['student', 'monitor', 'admin'].includes(role)) {
      console.error("❌ Invalid role value:", role);
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      console.error("❌ User not found for ID:", id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`✅ Role updated for ${user.email} to ${role}`);
    res.json({ message: 'User role updated successfully', user });
  } catch (error: any) {
    console.error("🔥 Error in updateUserRole:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== DELETE USER ====================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("🧨 Delete user request:", id);

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      console.error("❌ User not found for ID:", id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("🗑️ User deleted successfully:", user.email);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error("🔥 Error in deleteUser:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== ADMIN DASHBOARD STATS ====================
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingApprovals = await User.countDocuments({ approved: false });
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    console.log("📊 Admin Stats fetched successfully");

    res.json({
      totalUsers,
      pendingApprovals,
      totalAssignments,
      totalSubmissions
    });
  } catch (error: any) {
    console.error("🔥 Error in getAdminStats:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
