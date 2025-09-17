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
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Eye,
  MoreHorizontal
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'lead':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
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
        {/* Enhanced Recent Clients */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Clients</h3>
                <p className="text-sm text-gray-600 mt-1">Your latest client interactions</p>
              </div>
              <Link
                to="/clients"
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {stats.recentClients.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-indigo-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-600 mb-4">Start building your client base</p>
                <Link
                  to="/clients"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Add your first client
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentClients.map((client, index) => (
                  <motion.div
                    key={client._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(client.name)}
                      </div>
                      
                      {/* Client Info */}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                          {client.name}
                        </h4>
                        
                        {/* Contact Info */}
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Additional Info */}
                        <div className="flex items-center gap-4 mt-2">
                          {client.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{client.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>Added {formatDate(client.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Status & Actions */}
                    <div className="flex items-center gap-3">
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(client.status)}`}>
                        {client.status || 'Active'}
                      </span>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
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
      <MiniReminder />
    </motion.div>
  );
};

export default Dashboard;