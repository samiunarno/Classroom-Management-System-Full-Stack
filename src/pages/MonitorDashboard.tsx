import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Users,
  Calendar,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  Link,
} from "lucide-react";
import {
  assignmentApi,
  Assignment,
  Stats,
  Submission,
} from "../api/assignmentApi";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MonitorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "stats" | "assignments" | "create" | "submissions"
  >("stats");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal
  const [deleteId, setDeleteId] = useState<string | null>(null); // Store id of the assignment to delete

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, statsData] = await Promise.all([
        assignmentApi.getAssignments(),
        assignmentApi.getMonitorStats(),
      ]);
      setAssignments(assignmentsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load monitor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const allSubmissions: Submission[] = [];
      for (const assignment of assignments) {
        const subs = await assignmentApi.getAssignmentSubmissions(
          assignment._id
        );
        allSubmissions.push(...subs);
      }
      setSubmissions(allSubmissions);
    } catch (error) {
      console.error("Failed to load submissions:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "submissions" && assignments.length > 0) {
      loadSubmissions();
    }
  }, [activeTab, assignments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await assignmentApi.updateAssignment(editingId, formData);
        setEditingId(null);
      } else {
        await assignmentApi.createAssignment(formData);
      }
      setFormData({ title: "", description: "", deadline: "" });
      await loadData();
      setActiveTab("assignments");
      setShowModal(false); // Close the modal after submit
    } catch (error) {
      console.error("Failed to save assignment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      deadline: new Date(assignment.deadline).toISOString().slice(0, 16),
    });
    setEditingId(assignment._id);
    setActiveTab("create");
    setShowModal(true); // Open the modal for editing
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await assignmentApi.deleteAssignment(deleteId);
        await loadData();
        setShowDeleteModal(false); // Close the delete confirmation modal
      } catch (error) {
        console.error("Failed to delete assignment:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs = [
    { id: "stats" as const, label: "Overview", icon: FileText },
    { id: "assignments" as const, label: "Assignments", icon: FileText },
    {
      id: "create" as const,
      label: editingId ? "Edit Assignment" : "Create Assignment",
      icon: Plus,
    },
    { id: "submissions" as const, label: "Submissions", icon: Users },
  ];

  // Prepare data for the graph
  const chartData = [
    { name: "Assignments Created", value: stats?.assignmentsCreated ?? 0 },
    { name: "Total Submissions", value: stats?.totalSubmissions ?? 0 },
    { name: "Upcoming Deadlines", value: stats?.upcomingDeadlines ?? 0 },
  ];

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Monitor Dashboard
          </h1>
          <p className="text-gray-600">
            Manage assignments and track submissions
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-2xl p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white shadow-md text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "stats" && stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="col-span-1 md:col-span-3">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/20">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Assignments
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first assignment to get started.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Create Assignment
                  </button>
                </div>
              ) : (
                assignments.map((assignment) => (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {assignment.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {assignment.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Deadline:{" "}
                              {new Date(
                                assignment.deadline
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Created:{" "}
                              {new Date(
                                assignment.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(assignment._id);
                            setShowDeleteModal(true); // Show delete confirmation modal
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* ----------------- */}
          {activeTab === "submissions" && (
            <div className="space-y-4">
              <div>
                <a
                  href={import.meta.env.VITE_DROPBOX_FOLDER_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition-all duration-300"
                >
                  View in Dropbox
                </a>
              </div>
              {submissions.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/20">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Submissions
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No students have submitted assignments yet.
                  </p>
                </div>
              ) : (
                submissions.map((sub) => (
                  <motion.div
                    key={sub._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {sub.studentId.name} ({sub.studentId.email})
                        </h3>
                        <p className="text-gray-600">
                          Assignment: {sub.assignmentId.title}
                        </p>
                        <p className="text-gray-600">
                          Filename: {sub.filename}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Uploaded At:{" "}
                          {new Date(sub.uploadedAt).toLocaleString()}
                        </p>
                        {sub.dropboxDirectLink && (
                          <a
                            href={sub.dropboxDirectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Download from Dropbox
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {sub.emailMessageId && (
                          <CheckCircle
                            className="h-5 w-5 text-green-500"
                            title="Email sent"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* ----------------- */}

          {/* Modal for Create/Edit Assignment */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingId ? "Edit Assignment" : "Create New Assignment"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter assignment title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter assignment description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          {editingId ? "Updating..." : "Creating..."}
                        </div>
                      ) : editingId ? (
                        "Update Assignment"
                      ) : (
                        "Create Assignment"
                      )}
                    </motion.button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({
                            title: "",
                            description: "",
                            deadline: "",
                          });
                          setShowModal(false); // Close the modal
                        }}
                        className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Are you sure you want to delete this assignment?
                </h2>
                <div className="flex space-x-4">
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MonitorDashboard;
