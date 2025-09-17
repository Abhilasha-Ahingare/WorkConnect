// ClientProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  X,
  User,
  FileText
} from "lucide-react";

 function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    reminderDate: ""
  });

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clients/get-client/${id}`);
      setClient(res.data.client);
      setTasks(res.data.tasks || []);
      
      // Set default reminder date to current time
      setTaskForm(prev => ({
        ...prev,
        reminderDate: dayjs().format('YYYY-MM-DDTHH:mm')
      }));
    } catch (err) {
      console.error("Error loading client data:", err);
      alert("Error loading client data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.reminderDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const taskData = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        assignedClients: [client.email],
        reminderDate: new Date(taskForm.reminderDate).toISOString()
      };

      await api.post('/task/create-task', taskData);
      setShowCreateTask(false);
      setTaskForm({ title: "", description: "", reminderDate: dayjs().format('YYYY-MM-DDTHH:mm') });
      loadClientData(); // Refresh tasks
      alert("Task created successfully!");
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Error creating task. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Lead':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Converted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskPriority = (reminderDate) => {
    const now = dayjs();
    const taskTime = dayjs(reminderDate);
    const diffMinutes = taskTime.diff(now, 'minute');
    
    if (now.isAfter(taskTime)) {
      return { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertCircle size={14} /> };
    } else if (diffMinutes <= 60) {
      return { label: 'Urgent', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock size={14} /> };
    } else if (diffMinutes <= 1440) { // 24 hours
      return { label: 'Today', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Calendar size={14} /> };
    }
    return { label: 'Upcoming', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Clock size={14} /> };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-indigo-600"
        ></motion.div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Client not found</h3>
        <p className="text-gray-600 mb-6">The client you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/clients')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/clients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600"
            title="Back to Clients"
          >
            <ArrowLeft size={20} />
            Back
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
            <p className="text-gray-600 mt-1">Client Profile & Tasks</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateTask(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-md transition-all flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Create Task
        </motion.button>
      </div>

      {/* Client Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <User size={24} className="text-indigo-600" />
              Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <p className="text-gray-900 font-medium">{client.name}</p>
              </div>
              
              {client.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <p className="text-gray-900">
                    <a href={`mailto:${client.email}`} className="text-indigo-600 hover:text-indigo-700">
                      {client.email}
                    </a>
                  </p>
                </div>
              )}
              
              {client.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Phone
                  </label>
                  <p className="text-gray-900">
                    <a href={`tel:${client.phone}`} className="text-indigo-600 hover:text-indigo-700">
                      {client.phone}
                    </a>
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Client Since
                </label>
                <p className="text-gray-900">{dayjs(client.createdAt).format('MMM DD, YYYY')}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tasks Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={24} className="text-indigo-600" />
            Tasks & Reminders ({tasks.length})
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>Overdue</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span>Urgent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Today</span>
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-6">Create your first task or reminder for this client</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateTask(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Task
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const priority = getTaskPriority(task.reminderDate);
              return (
                <motion.div 
                  key={task._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priority.color} flex items-center gap-1`}>
                          {priority.icon}
                          {priority.label}
                        </span>
                        {!task.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Unread"></div>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {dayjs(task.reminderDate).format('MMM DD, YYYY')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {dayjs(task.reminderDate).format('hh:mm A')}
                        </span>
                        <span className="flex items-center gap-1">
                          {task.isCompleted ? 
                            <><CheckCircle size={14} className="text-emerald-500" /> Completed</> : 
                            <><Clock size={14} className="text-amber-500" /> Pending</>
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Create Task for {client.name}
                  </h3>
                  <button
                    onClick={() => setShowCreateTask(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      required
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="Enter task title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Enter task description"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={taskForm.reminderDate}
                      onChange={(e) => setTaskForm({ ...taskForm, reminderDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowCreateTask(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-all font-medium"
                    >
                      Create Task
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ClientProfile;