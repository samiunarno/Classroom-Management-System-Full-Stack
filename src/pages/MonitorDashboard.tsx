import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, FileText, Users, Calendar, Edit, Trash2, Clock, CheckCircle
} from 'lucide-react';
import { assignmentApi, Assignment, Stats, Submission } from '../api/assignmentApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MonitorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<'stats' | 'assignments' | 'create' | 'submissions'>('stats');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load assignments + stats
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
      console.error('Failed to load monitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load submissions
  const loadSubmissions = async () => {
    try {
      const all: Submission[] = [];

      for (const a of assignments) {
        const subs = await assignmentApi.getAssignmentSubmissions(a._id);
        all.push(...subs);
      }

      setSubmissions(all);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'submissions' && assignments.length > 0) {
      loadSubmissions();
    }
  }, [activeTab, assignments]);

  // Create/Edit assignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await assignmentApi.updateAssignment(editingId, formData);
      } else {
        await assignmentApi.createAssignment(formData);
      }

      setFormData({ title: '', description: '', deadline: '' });
      setEditingId(null);
      await loadData();
      setActiveTab('assignments');
      setShowModal(false);

    } catch (error) {
      console.error('Failed to save assignment:', error);
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
    setShowModal(true);
    setActiveTab('create');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await assignmentApi.deleteAssignment(deleteId);
      await loadData();
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs = [
    { id: 'stats' as const, label: 'Overview', icon: FileText },
    { id: 'assignments' as const, label: 'Assignments', icon: FileText },
    { id: 'create' as const, label: editingId ? 'Edit Assignment' : 'Create Assignment', icon: Plus },
    { id: 'submissions' as const, label: 'Submissions', icon: Users },
  ];

  const chartData = [
    { name: 'Assignments Created', value: stats?.assignmentsCreated ?? 0 },
    { name: 'Total Submissions', value: stats?.totalSubmissions ?? 0 },
    { name: 'Upcoming Deadlines', value: stats?.upcomingDeadlines ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
            Monitor Dashboard
          </h1>
          <p className="text-gray-600">Manage assignments and track submissions</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-2xl p-1 mb-8 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);

                // FIX: open modal when tab is create
                if (t.id === "create") {
                  setShowModal(true);
                  setEditingId(null);
                  setFormData({ title: "", description: "", deadline: "" });
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl ${
                activeTab === t.id
                  ? "bg-white shadow text-purple-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* ================= STATS ================= */}
          {activeTab === 'stats' && stats && (
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
          )}

          {/* ================= ASSIGNMENTS ================= */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              {assignments.map((a) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{a.title}</h3>
                      <p className="text-gray-600 mt-2">{a.description}</p>
                      <p className="text-gray-500 mt-2">
                        Deadline: {new Date(a.deadline).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(a)} className="p-2 text-blue-600">
                        <Edit />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(a._id);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ================= SUBMISSIONS ================= */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="bg-white p-6 text-center rounded-2xl shadow">
                  <Users className="w-16 h-16 mx-auto text-gray-300" />
                  <p>No submissions yet.</p>
                </div>
              ) : (
                submissions.map((sub) => (
                  <motion.div
                    key={sub._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 shadow border"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {sub.studentId?.name || "Unknown Student"}
                        </h3>

                        <p className="text-gray-700 mt-1">
                          <b>Assignment:</b> {sub.assignmentId?.title}
                        </p>

                        <p className="text-gray-700 mt-1">
                          <b>Submitted At:</b> {new Date(sub.uploadedAt).toLocaleString()}
                        </p>

                        <p className="text-gray-700 mt-1">
                          <b>File:</b> {sub.filename}
                        </p>
                      </div>

                      <CheckCircle className="text-green-500 w-7 h-7" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* ================= CREATE/EDIT MODAL (Fixed) ================= */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl w-96 shadow">
                <h2 className="text-2xl font-semibold mb-6">
                  {editingId ? "Edit Assignment" : "Create Assignment"}
                </h2>

                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={formData.title}
                    placeholder="Title"
                    required
                    className="w-full mb-4 p-3 border rounded"
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />

                  <textarea
                    value={formData.description}
                    placeholder="Description"
                    required
                    className="w-full mb-4 p-3 border rounded"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />

                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    required
                    className="w-full mb-4 p-3 border rounded"
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />

                  <button className="w-full py-3 bg-purple-600 text-white rounded-xl">
                    {editingId ? "Update" : "Create"}
                  </button>
                </form>

                <button
                  className="w-full mt-4 py-2 bg-gray-300 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ================= DELETE MODAL ================= */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-8 rounded-xl shadow w-80">
                <h2 className="text-lg font-semibold mb-4">
                  Delete this assignment?
                </h2>

                <div className="flex gap-4">
                  <button
                    className="flex-1 py-2 bg-red-600 text-white rounded"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>

                  <button
                    className="flex-1 py-2 bg-gray-300 rounded"
                    onClick={() => setShowDeleteModal(false)}
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
