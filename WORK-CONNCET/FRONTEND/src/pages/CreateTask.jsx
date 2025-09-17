import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNotifications } from "../contexts/NotificationContext";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, FileText, Loader, CheckSquare, Users } from "lucide-react";
import {toast} from "react-toastify"

const CreateTaskModal = ({ isOpen, onClose, preselectedClientId = null }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [reminderDate, setReminderDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { addLocalNotification } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      loadClients();
      // Set default date to current time
      setReminderDate(dayjs().format('YYYY-MM-DDTHH:mm'));
      
      // Reset selected clients when modal opens
      if (preselectedClientId) {
        setSelectedClients([preselectedClientId]);
      } else {
        setSelectedClients([]);
      }
    }
  }, [isOpen, preselectedClientId]);

  const loadClients = async () => {
    try {
      const response = await api.get('/clients/get-all-client');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || selectedClients.length === 0 || !reminderDate) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Convert selected client IDs to emails for backend
      const selectedClientEmails = clients
        .filter(c => selectedClients.includes(c._id))
        .map(c => c.email);

      const taskData = {
        title: title.trim(),
        description: description.trim(),
        assignedClients: selectedClientEmails,
        reminderDate: new Date(reminderDate).toISOString()
      };

      const response = await api.post('/task/create-task', taskData);
      
      // Add to local notifications
      addLocalNotification({
        ...response.data.task,
        assignedClients: clients.filter(c => selectedClients.includes(c._id))
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedClients(preselectedClientId ? [preselectedClientId] : []);
      setReminderDate(dayjs().format('YYYY-MM-DDTHH:mm'));
      onClose();
      
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-slate-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Create New Task</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="Enter task title"
                    required
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                    rows="3"
                    placeholder="Enter task description"
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assign to Clients *
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-3 bg-white shadow-inner">
                    {clients.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-2">No clients available</p>
                    ) : (
                      clients.map((client) => (
                        <motion.label 
                          whileHover={{ backgroundColor: "#f8fafc" }}
                          key={client._id} 
                          className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedClients.includes(client._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedClients([...selectedClients, client._id]);
                                } else {
                                  setSelectedClients(selectedClients.filter(id => id !== client._id));
                                }
                              }}
                              className="hidden"
                            />
                            <div className={`w-5 h-5 flex items-center justify-center border rounded ${selectedClients.includes(client._id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
                              {selectedClients.includes(client._id) && (
                                <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-800">{client.name}</span>
                            <span className="text-xs text-slate-500">{client.status}</span>
                          </div>
                        </motion.label>
                      ))
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Reminder Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                    required
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 pt-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Create Task
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;