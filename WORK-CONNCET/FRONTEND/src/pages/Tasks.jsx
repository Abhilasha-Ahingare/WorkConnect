import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import dayjs from "dayjs";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [filter, setFilter] = useState('all'); // all, today, overdue, completed
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedClients: [],
    reminderDate: ""
  });

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
      
      // Set default reminder date
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
      // Convert selected client IDs to emails for backend
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
      alert("Task created successfully!");
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Error creating task. Please try again.");
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
      return { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' };
    }
    
    const now = dayjs();
    const taskTime = dayjs(reminderDate);
    const diffMinutes = taskTime.diff(now, 'minute');
    
    if (now.isAfter(taskTime)) {
      return { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' };
    } else if (diffMinutes <= 60) {
      return { label: 'Urgent', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚡' };
    } else if (diffMinutes <= 1440) { // 24 hours
      return { label: 'Today', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📅' };
    }
    return { label: 'Upcoming', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '⏰' };
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tasks & Reminders</h1>
          <p className="text-gray-600 mt-1">Manage your client tasks and deadlines</p>
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <span className="text-lg">+</span>
          Create Task
        </button>
      </div>

      {/* Stats & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{tasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter(t => dayjs(t.reminderDate).isSame(dayjs(), 'day')).length}
            </div>
            <div className="text-sm text-gray-600">Due Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(t => dayjs().isAfter(dayjs(t.reminderDate)) && !t.isCompleted).length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.isCompleted).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Tasks', count: tasks.length },
            { key: 'today', label: 'Today', count: tasks.filter(t => dayjs(t.reminderDate).isSame(dayjs(), 'day')).length },
            { key: 'overdue', label: 'Overdue', count: tasks.filter(t => dayjs().isAfter(dayjs(t.reminderDate)) && !t.isCompleted).length },
            { key: 'completed', label: 'Completed', count: tasks.filter(t => t.isCompleted).length }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Create your first task to get started' 
              : `No tasks match the ${filter} filter`
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateTask(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks
            .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))
            .map((task) => {
              const priority = getTaskPriority(task.reminderDate, task.isCompleted);
              return (
                <div key={task._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priority.color} flex items-center gap-1`}>
                          <span>{priority.icon}</span>
                          {priority.label}
                        </span>
                        {!task.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Unread"></div>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          📅 {dayjs(task.reminderDate).format('MMM DD, YYYY')}
                        </span>
                        <span className="flex items-center gap-1">
                          🕒 {dayjs(task.reminderDate).format('hh:mm A')}
                        </span>
                        {task.assignedClients && task.assignedClients.length > 0 && (
                          <span className="flex items-center gap-1">
                            👥 {task.assignedClients.map(client => client.name || client).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {!task.isRead && (
                        <button
                          onClick={() => markAsRead(task._id)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Create New Task</h3>
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
                    Assign to Clients *
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {clients.map((client) => (
                      <label key={client._id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded">
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
                          className="rounded"
                        />
                        <span className="text-sm">
                          {client.name} <span className="text-gray-500">({client.status})</span>
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