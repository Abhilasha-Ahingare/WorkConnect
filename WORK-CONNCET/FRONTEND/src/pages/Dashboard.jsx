import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";
import UpcomingReminders from "../components/UpcomingReminder";
import MiniReminder from "../components/MiniReminder";
import api from "../api/api";
import { motion } from "framer-motion";
import { 
  PlusCircle, 
  Users, 
  ArrowRight, 
  User, 
  Clipboard, 
  CheckCircle2, 
  Bell,
  Calendar,
  Clock,
  AlertCircle
} from "lucide-react";

const Dashboard = () => {
  const { notifications, unreadCount, socket, connectionError } = useNotifications();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalTasks: 0,
    completedTasks: 0,
    recentClients: [],
  });
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Enable audio on user interaction (required by browsers)
    const enableAudio = () => {
      setAudioEnabled(true);
      document.removeEventListener('click', enableAudio);
    };
    
    document.addEventListener('click', enableAudio);
    
    return () => {
      document.removeEventListener('click', enableAudio);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      const dashboardData = response.data.data;

      setStats({
        totalClients: dashboardData.totalClients,
        totalTasks: dashboardData.totalTasks,
        completedTasks: dashboardData.completedTasks,
        recentClients: dashboardData.recentClients,
        upcomingTasks: dashboardData.upcomingTasks,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your client management system
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* {connectionError && (
            <div className="flex items-center gap-1 text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full">
              <AlertCircle size={14} />
              Connection Issue
            </div>
          )}
          {socket && (
            <div className="flex items-center gap-1 text-green-500 text-sm bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Connected
            </div>
          )} */}
          <Link
            to="/task/create-task"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Quick Add Task
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg mr-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Clients</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalClients}</p>
          </div>
        </div>
        
        {/* Total Tasks Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-green-100 rounded-lg mr-4">
            <Clipboard className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalTasks}</p>
          </div>
        </div>
        
        {/* Completed Tasks Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg mr-4">
            <CheckCircle2 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed Tasks</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completedTasks}</p>
          </div>
        </div>
        
        {/* Notifications Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-amber-100 rounded-lg mr-4">
            <Bell className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Notifications</p>
            <p className="text-2xl font-bold text-gray-800">{unreadCount}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Clients
            </h3>
            <Link
              to="/clients"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {stats.recentClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <p>No clients yet</p>
              <Link
                to="/clients"
                className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block"
              >
                Add your first client
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentClients.map((client) => (
                <motion.div
                  key={client._id}
                  whileHover={{ y: -2 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">{client.name}</h4>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === "Lead"
                          ? "bg-amber-100 text-amber-800"
                          : client.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {client.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Upcoming Reminders
            </h3>
            <Link
              to="/tasks"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <UpcomingReminders tasks={notifications} limit={6} />
          </div>
        </div>
      </motion.div>
      
      {/* Connection status indicator */}
      {!socket && !connectionError && (
        <div className="fixed bottom-4 left-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Connecting to notifications...
        </div>
      )}
      
      {/* Audio enable prompt */}
      {!audioEnabled && (
        <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Click anywhere to enable notification sounds
        </div>
      )}
      
      {/* Mini Reminder Popup for new notifications */}
      {/* <MiniReminder /> */}
    </motion.div>
  );
};

export default Dashboard;