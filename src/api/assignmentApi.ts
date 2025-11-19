import axiosClient from './axiosClient';

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  hasSubmitted?: boolean;
  submissionDate?: string;
}

export interface CreateAssignmentData {
  title: string;
  description: string;
  deadline: string;
}

export interface Submission {
  _id: string;
  filename: string;
  uploadedAt: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  assignmentId: {
    _id: string;
    title: string;
  };
}

export interface Stats {
  assignmentsAvailable?: number;
  submitted?: number;
  pending?: number;
  nextDeadline?: string;
  assignmentsCreated?: number;
  totalSubmissions?: number;
  upcomingDeadlines?: number;
  totalUsers?: number;
  pendingApprovals?: number;
  totalAssignments?: number;
}

export const assignmentApi = {
  // Assignments
  createAssignment: async (data: CreateAssignmentData): Promise<Assignment> => {
    const response = await axiosClient.post('/assignments', data);
    return response.data;
  },

  getAssignments: async (): Promise<Assignment[]> => {
    const response = await axiosClient.get('/assignments');
    return response.data;
  },

  getAssignmentById: async (id: string): Promise<Assignment> => {
    const response = await axiosClient.get(`/assignments/${id}`);
    return response.data;
  },

  updateAssignment: async (id: string, data: CreateAssignmentData): Promise<Assignment> => {
    const response = await axiosClient.put(`/assignments/${id}`, data);
    return response.data;
  },

  deleteAssignment: async (id: string): Promise<void> => {
    await axiosClient.delete(`/assignments/${id}`);
  },

  // Submissions
  submitAssignment: async (id: string, file: File): Promise<{ message: string; submission: any }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 Uploading file:', {
      filename: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });

    try {
      const response = await axiosClient.post(`/assignments/${id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout
      });
      
      console.log('✅ Upload successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  },

  getAssignmentSubmissions: async (id: string): Promise<Submission[]> => {
    const response = await axiosClient.get(`/assignments/${id}/submissions`);
    return response.data;
  },

  // Stats
  getStudentStats: async (): Promise<Stats> => {
    const response = await axiosClient.get('/assignments/student/stats/overview');
    return response.data;
  },

  getMonitorStats: async (): Promise<Stats> => {
    const response = await axiosClient.get('/assignments/monitor/stats/overview');
    return response.data;
  },
};