import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";
import StatsCard from "../components/StatsCard";
import UpcomingReminders from "../components/UpcomingReminders";
import api from "../api/api";

const Dashboard = () => {
  const { notifications, unreadCount } = useNotifications();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalTasks: 0,
    completedTasks: 0,
    recentClients: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [clientsResponse, tasksResponse] = await Promise.all([
        api.get('/clients/get-all-client'),
        api.get('/task/get-all-task')
      ]);

      const clients = clientsResponse.data.clients || [];
      const tasks = tasksResponse.data || [];

      setStats({
        totalClients: clients.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.isCompleted).length,
        recentClients: clients.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your client management system</p>
        </div>
        <Link
          to="/create-task"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Quick Add Task
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Clients"
          value={stats.totalClients}
          icon="👥"
          color="blue"
        />
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon="📋"
          color="green"
        />
        <StatsCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon="✅"
          color="purple"
        />
        <StatsCard
          title="Pending Notifications"
          value={unreadCount}
          icon="🔔"
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Clients</h3>
            <Link 
              to="/clients"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {stats.recentClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No clients yet</p>
              <Link 
                to="/clients"
                className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
              >
                Add your first client
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentClients.map((client) => (
                <div 
                  key={client._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">{client.name}</h4>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'Lead' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : client.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {client.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Reminders</h3>
            <Link 
              to="/tasks"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <UpcomingReminders tasks={notifications} limit={6} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;