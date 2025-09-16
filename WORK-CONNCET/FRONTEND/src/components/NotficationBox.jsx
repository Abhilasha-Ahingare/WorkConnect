import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import dayjs from "dayjs";

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

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(a.reminderDate) - new Date(b.reminderDate)
  );

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md"
      >
        <svg 
          className="w-6 h-6 text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <span className="text-sm text-gray-500">
                {unreadCount} unread
              </span>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {sortedNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-4xl mb-2">🎉</div>
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedNotifications.map((notification) => {
                  const isUrgent = dayjs(notification.reminderDate).diff(dayjs(), 'minute') <= 60 
                    && dayjs().isBefore(dayjs(notification.reminderDate));
                  const isOverdue = dayjs().isAfter(dayjs(notification.reminderDate));
                  
                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      } ${
                        isOverdue ? 'border-l-4 border-red-500' : 
                        isUrgent ? 'border-l-4 border-yellow-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-800 text-sm">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {isOverdue && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  Overdue
                                </span>
                              )}
                              {isUrgent && !isOverdue && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
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
                          
                          <p className="text-xs text-gray-400 mt-2">
                            {dayjs(notification.reminderDate).format('MMM DD, YYYY [at] hh:mm A')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBox;