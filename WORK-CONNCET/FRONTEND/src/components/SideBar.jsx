// SideBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Home, 
  Users, 
  CheckLine, 
  PlusCircle, 
  LogOut,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();


  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/clients", label: "Clients", icon: <Users size={20} /> },
    { to: "/task", label: "Tasks", icon: <CheckLine size={20} /> },
    { to: "/task/create-task", label: "Create Task", icon: <PlusCircle size={20} /> },
  ];

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white shadow-xl z-50"
    >
      <div className="p-6 h-full flex flex-col">
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="bg-white p-2 rounded-lg">
              <BarChart3 className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                WorkConnect
              </h1>
              <p className="text-sm text-indigo-200 mt-1">Client Management System</p>
            </div>
          </motion.div>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.to;
            return (
              <motion.div
                key={item.to}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white shadow-lg backdrop-blur-sm"
                      : "text-indigo-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <motion.div 
          className="mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;