import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import dayjs from "dayjs";

export default function ClientProfile() {
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Converted':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskPriority = (reminderDate) => {
    const now = dayjs();
    const taskTime = dayjs(reminderDate);
    const diffMinutes = taskTime.diff(now, 'minute');
    
    if (now.isAfter(taskTime)) {
      return { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (diffMinutes <= 60) {
      return { label: 'Urgent', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else if (diffMinutes <= 1440) { // 24 hours
      return { label: 'Today', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    return { label: 'Upcoming', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Clients"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
            <p className="text-gray-600 mt-1">Client Profile & Tasks</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <span className="text-lg">+</span>
          Create Task
        </button>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 font-medium">{client.name}</p>
              </div>
              
              {client.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-700">
                      {client.email}
                    </a>
                  </p>
                </div>
              )}
              
              {client.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">
                    <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-700">
                      {client.phone}
                    </a>
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Since</label>
                <p className="text-gray-900">{dayjs(client.createdAt).format('MMM DD, YYYY')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Tasks & Reminders ({tasks.length})
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-3 h-3 bg-red-200 rounded-full"></span>
            <span>Overdue</span>
            <span className="w-3 h-3 bg-yellow-200 rounded-full ml-4"></span>
            <span>Urgent</span>
            <span className="w-3 h-3 bg-blue-200 rounded-full ml-4"></span>
            <span>Today</span>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-6">Create your first task or reminder for this client</p>
            <button
              onClick={() => setShowCreateTask(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const priority = getTaskPriority(task.reminderDate);
              return (
                <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priority.color}`}>
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
                          📅 {dayjs(task.reminderDate).format('MMM DD, YYYY')}
                        </span>
                        <span className="flex items-center gap-1">
                          🕒 {dayjs(task.reminderDate).format('hh:mm A')}
                        </span>
                        <span className="flex items-center gap-1">
                          {task.isCompleted ? '✅ Completed' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Create Task for {client.name}
                </h3>
                <button
                  onClick={() => setShowCreateTask(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Enter task title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Enter task description"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={taskForm.reminderDate}
                    onChange={(e) => setTaskForm({ ...taskForm, reminderDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateTask(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}