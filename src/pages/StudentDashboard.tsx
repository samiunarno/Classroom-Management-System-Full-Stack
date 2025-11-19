import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Clock, CheckCircle, AlertCircle, Calendar, FileText, X } from 'lucide-react';
import { assignmentApi, Assignment, Stats } from '../api/assignmentApi';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, statsData] = await Promise.all([
        assignmentApi.getAssignments(),
        assignmentApi.getStudentStats(),
      ]);
      setAssignments(assignmentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateFilename = (filename: string): boolean => {
    // More flexible filename validation
    const regex = /^[\u4E00-\u9FFFA-Za-z0-9\s_\-]+\.pdf$/i;
    return regex.test(filename);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed');
      setSelectedFile(null);
      return;
    }

    // Validate file size (5MB max for faster upload)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File size must be less than 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      setSelectedFile(null);
      return;
    }

    // Validate filename
    if (!validateFilename(file.name)) {
      setUploadError('Filename must contain Chinese/English characters, numbers, spaces, underscores, or hyphens and end with .pdf');
      setSelectedFile(null);
      return;
    }

    console.log('✅ File validated:', {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });

    setSelectedFile(file);
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setUploadError('');
    setFileInputKey(Date.now());
    setUploadProgress(0);
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }

    setUploadingId(assignmentId);
    setUploadError('');
    setUploadProgress(0);

    try {
      console.log('🚀 Starting upload for assignment:', assignmentId);
      
      // Create custom axios request
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await assignmentApi.submitAssignment(assignmentId, selectedFile);
      
      // Success
      console.log('🎉 Upload completed successfully');
      clearFileSelection();
      await loadData();
      
    } catch (error: any) {
      console.error('💥 Upload error:', error);
      setUploadProgress(0);
      
      // Detailed error handling
      if (error.code === 'ECONNABORTED') {
        setUploadError('Upload took too long. Please try with a smaller file or check your internet connection.');
      } else if (error.message === 'Network Error') {
        setUploadError('Network error. Please check your internet connection.');
      } else if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        
        switch (status) {
          case 400:
            setUploadError(`Invalid request: ${message}`);
            break;
          case 401:
            setUploadError('Please login again');
            break;
          case 413:
            setUploadError('File too large. Please choose a smaller file.');
            break;
          case 500:
            setUploadError('Server error. Please try again later.');
            break;
          default:
            setUploadError(`Upload failed: ${message} (Status: ${status})`);
        }
      } else {
        setUploadError('Upload failed. Please try again.');
      }
    } finally {
      setUploadingId(null);
    }
  };

  const isDeadlinePassed = (deadline: string): boolean => {
    return new Date() > new Date(deadline);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Student Dashboard
          </h1>
          <p className="text-gray-600">View assignments and submit your work</p>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Assignments', value: stats.assignmentsAvailable || 0, icon: BookOpen, color: 'purple' },
              { label: 'Submitted', value: stats.submitted || 0, icon: CheckCircle, color: 'green' },
              { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'orange' },
              { 
                label: 'Next Deadline', 
                value: stats.nextDeadline ? new Date(stats.nextDeadline).toLocaleDateString() : 'None', 
                icon: Calendar, 
                color: 'blue' 
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-500 rounded-xl flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Assignments List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
          {assignments.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/20">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments</h3>
              <p className="text-gray-600">No assignments have been created yet.</p>
            </div>
          ) : (
            assignments.map((assignment, index) => (
              <motion.div
                key={assignment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                      <p className="text-gray-600 mb-4">{assignment.description}</p>
                    </div>
                    <div className="ml-4">
                      {assignment.hasSubmitted ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Submitted</span>
                        </div>
                      ) : isDeadlinePassed(assignment.deadline) ? (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">Deadline Passed</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(assignment.deadline).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Upload Section */}
                  {!assignment.hasSubmitted && !isDeadlinePassed(assignment.deadline) && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Submit Assignment</h4>
                      
                      {uploadError && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start space-x-2"
                        >
                          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium">Upload Error</p>
                            <p className="text-sm">{uploadError}</p>
                          </div>
                          <button 
                            onClick={() => setUploadError('')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload PDF (Chinese/English filename, e.g., 王小明.pdf or assignment1.pdf)
                          </label>
                          <input
                            key={fileInputKey}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum file size: 5MB • Allowed: PDF files only
                          </p>
                        </div>

                        {selectedFile && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <p className="text-green-800 font-medium">
                                {selectedFile.name}
                              </p>
                              <p className="text-green-600 text-sm">
                                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={clearFileSelection}
                              className="text-green-600 hover:text-green-800 p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </motion.div>
                        )}

                        {/* Upload Button with Progress */}
                        <div className="space-y-2">
                          <motion.button
                            whileHover={{ scale: selectedFile ? 1.02 : 1 }}
                            whileTap={{ scale: selectedFile ? 0.98 : 1 }}
                            onClick={() => handleSubmit(assignment._id)}
                            disabled={!selectedFile || uploadingId === assignment._id}
                            className="relative w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                          >
                            {uploadingId === assignment._id ? (
                              <>
                                {/* Progress Bar Background */}
                                <div 
                                  className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 transition-all duration-300" 
                                  style={{ width: `${uploadProgress}%` }} 
                                />
                                
                                {/* Content */}
                                <div className="relative z-10 flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                  <span>
                                    {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Starting upload...'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <Upload className="h-5 w-5" />
                                <span>Submit Assignment</span>
                              </>
                            )}
                          </motion.button>

                          {/* Progress Bar */}
                          {uploadingId === assignment._id && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Upload Tips */}
                        {!uploadingId && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm">
                              <strong>Tip:</strong> For faster uploads, keep files under 2MB. 
                              If upload fails, check your internet connection and try again.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {assignment.hasSubmitted && assignment.submissionDate && (
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">
                          Submitted on {new Date(assignment.submissionDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;