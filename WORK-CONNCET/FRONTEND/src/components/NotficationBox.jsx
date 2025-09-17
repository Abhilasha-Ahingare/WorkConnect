// NotificationBox.jsx (fixed)
import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import dayjs from "dayjs";
import { Bell, AlertCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NotificationBox = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.reminderDate) - new Date(a.reminderDate)
  );

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-white hover:bg-indigo-50 border border-indigo-100 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <Bell className="w-5 h-5 text-indigo-600" />
        
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-md"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-indigo-900">Notifications</h3>
                <span className="text-sm font-medium text-indigo-500 bg-indigo-100 px-2 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              </div>
            </div>

            <div className="overflow-y-auto max-h-80">
              {sortedNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Bell className="w-6 h-6 text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-gray-600">No notifications yet</p>
                  <p className="text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sortedNotifications.map((notification) => {
                    const isUrgent = dayjs(notification.reminderDate).diff(dayjs(), 'minute') <= 60 
                      && dayjs().isBefore(dayjs(notification.reminderDate));
                    const isOverdue = dayjs().isAfter(dayjs(notification.reminderDate));
                    
                    return (
                      <motion.div
                        key={notification._id || `notif-${Date.now()}-${Math.random()}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        } ${
                          isOverdue ? 'border-l-4 border-red-500' : 
                          isUrgent ? 'border-l-4 border-amber-500' : 'border-l-4 border-indigo-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                {isOverdue && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Overdue
                                  </span>
                                )}
                                {isUrgent && !isOverdue && (
                                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center gap-1">
                                    <Clock size={12} />
                                    Urgent
                                  </span>
                                )}
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            
                            {notification.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.description}
                              </p>
                            )}
                            
                            {notification.assignedClients?.length > 0 && (
                              <p className="text-xs text-gray-500 mt-2">
                                Clients: {notification.assignedClients.map(c => c.name).join(', ')}
                              </p>
                            )}
                            
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Clock size={12} />
                              {dayjs(notification.reminderDate).format('MMM DD, YYYY [at] hh:mm A')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {sortedNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-1"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBox;