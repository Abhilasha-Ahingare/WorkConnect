import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNotifications } from "../contexts/NotificationContext";
import dayjs from "dayjs";

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
      
      if (preselectedClientId) {
        setSelectedClients([preselectedClientId]);
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
      setSelectedClients([]);
      setReminderDate("");
      onClose();
      
      alert('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Create New Task</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter task description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Clients *
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {clients.map((client) => (
                  <label key={client._id} className="flex items-center gap-2 p-1">
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
                      className="rounded"
                    />
                    <span className="text-sm">
                      {client.name} ({client.status})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Date & Time *
              </label>
              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
