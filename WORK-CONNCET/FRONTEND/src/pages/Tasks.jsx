import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users,  
  AlertCircle, 
  Bell, 
  X,
  Filter,
  Eye,
  Edit,
  Trash2,
  User,
  CheckCircle2,
  Save,
  Loader
} from "lucide-react";
import {toast} from "react-toastify"

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedClients: [],
    reminderDate: ""
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    assignedClients: [],
    reminderDate: ""
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, clientsResponse] = await Promise.all([
        api.get("/task/get-all-task"),
        api.get("/clients/get-all-client")
      ]);
      
      setTasks(tasksResponse.data || []);
      setClients(clientsResponse.data.clients || []);
      
      setTaskForm(prev => ({
        ...prev,
        reminderDate: dayjs().format('YYYY-MM-DDTHH:mm')
      }));
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || taskForm.assignedClients.length === 0 || !taskForm.reminderDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const selectedClientEmails = clients
        .filter(c => taskForm.assignedClients.includes(c._id))
        .map(c => c.email);

      const taskData = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        assignedClients: selectedClientEmails,
        reminderDate: new Date(taskForm.reminderDate).toISOString()
      };

      await api.post('/task/create-task', taskData);
      setShowCreateTask(false);
      setTaskForm({
        title: "",
        description: "",
        assignedClients: [],
        reminderDate: dayjs().format('YYYY-MM-DDTHH:mm')
      });
      loadData();
      toast.info("Task created successfully!");
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("Error creating task. Please try again.");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      assignedClients: task.assignedClients.map(client => client._id),
      reminderDate: dayjs(task.reminderDate).format('YYYY-MM-DDTHH:mm')
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || editForm.assignedClients.length === 0 || !editForm.reminderDate) {
      alert("Please fill in all required fields");
      return;
    }

    setUpdating(true);
    try {
      const selectedClientEmails = clients
        .filter(c => editForm.assignedClients.includes(c._id))
        .map(c => c.email);

      const taskData = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        assignedClients: selectedClientEmails,
        reminderDate: new Date(editForm.reminderDate).toISOString()
      };

      await api.patch(`/task/${editingTask._id}`, taskData);
      setIsEditModalOpen(false);
      setEditingTask(null);
      loadData();
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("Error updating task. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    setDeleting(taskId);
    try {
      await api.delete(`/task/${taskId}`);
      loadData();
      toast.success("Task deleted successfully!");
    } catch (err) {
      // console.error("Error deleting task:", err);
      toast.error("Error deleting task. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const markAsRead = async (taskId) => {
    try {
      await api.patch(`/task/${taskId}/read`);
      loadData();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAsCompleted = async (taskId) => {
    try {
      await api.patch(`/task/${taskId}`, { isCompleted: true });
      loadData();
    } catch (err) {
      console.error("Error marking as completed:", err);
    }
  };

  const getFilteredTasks = () => {
    const now = dayjs();
    
    switch (filter) {
      case 'today':
        return tasks.filter(task => {
          const taskDate = dayjs(task.reminderDate);
          return taskDate.isSame(now, 'day');
        });
      case 'overdue':
        return tasks.filter(task => {
          return now.isAfter(dayjs(task.reminderDate)) && !task.isCompleted;
        });
      case 'completed':
        return tasks.filter(task => task.isCompleted);
      default:
        return tasks;
    }
  };

  const getTaskPriority = (reminderDate, isCompleted) => {
    if (isCompleted) {
      return { 
        label: 'Completed', 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
        icon: <CheckCircle2 size={14} /> 
      };
    }
    
    const now = dayjs();
    const taskTime = dayjs(reminderDate);
    const diffMinutes = taskTime.diff(now, 'minute');
    
    if (now.isAfter(taskTime)) {
      return { 
        label: 'Overdue', 
        color: 'bg-rose-100 text-rose-800 border-rose-200', 
        icon: <AlertCircle size={14} /> 
      };
    } else if (diffMinutes <= 60) {
      return { 
        label: 'Urgent', 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        icon: <Bell size={14} /> 
      };
    } else if (diffMinutes <= 1440) {
      return { 
        label: 'Today', 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: <Calendar size={14} /> 
      };
    }
    return { 
      label: 'Upcoming', 
      color: 'bg-slate-100 text-slate-800 border-slate-200', 
      icon: <Clock size={14} /> 
    };
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Tasks & Reminders</h1>
          <p className="text-slate-600 mt-1">Manage your client tasks and deadlines</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateTask(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20">
          <Plus size={20} />
          Create Task
        </motion.button>
      </div>

      {/* Stats & Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-slate-800">{tasks.length}</div>
            <div className="text-sm text-slate-600">Total Tasks</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => dayjs(t.reminderDate).isSame(dayjs(), 'day')).length}
            </div>
            <div className="text-sm text-blue-600">Due Today</div>
          </div>
          <div className="text-center p-4 bg-rose-50 rounded-xl">
            <div className="text-2xl font-bold text-rose-600">
              {tasks.filter(t => dayjs().isAfter(dayjs(t.reminderDate)) && !t.isCompleted).length}
            </div>
            <div className="text-sm text-rose-600">Overdue</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-600">
              {tasks.filter(t => t.isCompleted).length}
            </div>
            <div className="text-sm text-emerald-600">Completed</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Filter size={18} />
            <span className="font-medium">Filter by:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Tasks', count: tasks.length },
              { key: 'today', label: 'Today', count: tasks.filter(t => dayjs(t.reminderDate).isSame(dayjs(), 'day')).length },
              { key: 'overdue', label: 'Overdue', count: tasks.filter(t => dayjs().isAfter(dayjs(t.reminderDate)) && !t.isCompleted).length },
              { key: 'completed', label: 'Completed', count: tasks.filter(t => t.isCompleted).length }
            ].map((filterOption) => (
              <motion.button
                key={filterOption.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  filter === filterOption.key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {filterOption.label} 
                <span className={`px-2 py-1 rounded-full text-xs ${
                  filter === filterOption.key ? 'bg-white/20' : 'bg-slate-300'
                }`}>
                  {filterOption.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tasks List */}
      <AnimatePresence mode="wait">
        {filteredTasks.length === 0 ? (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </h3>
            <p className="text-slate-600 mb-6">
              {filter === 'all' 
                ? 'Create your first task to get started' 
                : `No tasks match the ${filter} filter`
              }
            </p>
            {filter === 'all' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateTask(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                Create Task
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="tasks-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4"
          >
            {filteredTasks
              .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))
              .map((task, index) => {
                const priority = getTaskPriority(task.reminderDate, task.isCompleted);
                return (
                  <motion.div 
                    key={task._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-300 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-slate-800">{task.title}</h3>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${priority.color} flex items-center gap-1`}>
                            {priority.icon}
                            {priority.label}
                          </span>
                          {!task.isRead && !task.isCompleted && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Unread"></div>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-slate-600 mb-3">{task.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {dayjs(task.reminderDate).format('MMM DD, YYYY')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {dayjs(task.reminderDate).format('hh:mm A')}
                          </span>
                          {task.assignedClients && task.assignedClients.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users size={16} />
                              {task.assignedClients.map(client => client.name || client).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row justify-center gap-2 ml-4">
                        {!task.isRead && !task.isCompleted && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAsRead(task._id)}
                            className="px-3 py-1.5 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                          >
                            <Eye size={14} />
                            Mark Read
                          </motion.button>
                        )}
                        
                        {!task.isCompleted && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAsCompleted(task._id)}
                            className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 size={14} />
                            Complete
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditTask(task)}
                          className="px-3 py-1.5 text-xs bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
                        >
                          <Edit size={14} />
                          Edit
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteTask(task._id)}
                          disabled={deleting === task._id}
                          className="px-3 py-1.5 text-xs bg-rose-100 text-rose-800 rounded-lg hover:bg-rose-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {deleting === task._id ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">Create New Task</h3>
                  <button
                    onClick={() => setShowCreateTask(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Task Title *
                    </label>
                    <input
                      required
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="Enter task title"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Enter task description"
                      rows="3"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Assign to Clients *
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-slate-300 rounded-xl p-3 space-y-2">
                      {clients.map((client) => (
                        <label key={client._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={taskForm.assignedClients.includes(client._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTaskForm({
                                  ...taskForm,
                                  assignedClients: [...taskForm.assignedClients, client._id]
                                });
                              } else {
                                setTaskForm({
                                  ...taskForm,
                                  assignedClients: taskForm.assignedClients.filter(id => id !== client._id)
                                });
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm">
                              <User size={16} />
                            </div>
                            <span className="text-sm">
                              {client.name} <span className="text-slate-500">({client.status})</span>
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Reminder Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={taskForm.reminderDate}
                      onChange={(e) => setTaskForm({ ...taskForm, reminderDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowCreateTask(false)}
                      className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
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

      {/* Edit Task Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">Edit Task</h3>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingTask(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleUpdateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Task Title *
                    </label>
                    <input
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Enter task title"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Enter task description"
                      rows="3"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Assign to Clients *
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-slate-300 rounded-xl p-3 space-y-2">
                      {clients.map((client) => (
                        <label key={client._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={editForm.assignedClients.includes(client._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditForm({
                                  ...editForm,
                                  assignedClients: [...editForm.assignedClients, client._id]
                                });
                              } else {
                                setEditForm({
                                  ...editForm,
                                  assignedClients: editForm.assignedClients.filter(id => id !== client._id)
                                });
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm">
                              <User size={16} />
                            </div>
                            <span className="text-sm">
                              {client.name} <span className="text-slate-500">({client.status})</span>
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Reminder Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editForm.reminderDate}
                      onChange={(e) => setEditForm({ ...editForm, reminderDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingTask(null);
                      }}
                      className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={updating}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Update Task
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tasks;