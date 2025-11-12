import axiosClient from './axiosClient';
import { User } from './authApi';

export const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await axiosClient.get('/users');
    return response.data;
  },

  getPendingUsers: async (): Promise<User[]> => {
    const response = await axiosClient.get('/users/pending');
    return response.data;
  },

  approveUser: async (id: string): Promise<{ message: string; user: User }> => {
    const response = await axiosClient.post(`/users/${id}/approve`);
    return response.data;
  },

  updateUserRole: async (id: string, role: string): Promise<{ message: string; user: User }> => {
    const response = await axiosClient.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },

  getAdminStats: async (): Promise<{
    totalUsers: number;
    pendingApprovals: number;
    totalAssignments: number;
    totalSubmissions: number;
  }> => {
    const response = await axiosClient.get('/users/admin/stats/overview');
    return response.data;
  },
};