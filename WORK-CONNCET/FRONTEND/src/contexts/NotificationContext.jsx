import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/api";
import dayjs from "dayjs";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Load initial notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.get('/task/upcoming');
        const allTasks = [
          ...(response.data.today || []),
          ...(response.data.tomorrow || [])
        ];
        setNotifications(allTasks);
        updateUnreadCount(allTasks);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  // Socket connection
  useEffect(() => {
    const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketURL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      const token = localStorage.getItem('token');
      if (token) {
        newSocket.emit('register', 'user-id'); // You can extract user ID from token
      }
    });

    newSocket.on('new-reminder', (reminder) => {
      setNotifications(prev => {
        const updated = [reminder, ...prev].sort(
          (a, b) => new Date(a.reminderDate) - new Date(b.reminderDate)
        );
        updateUnreadCount(updated);
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const updateUnreadCount = (notificationsList) => {
    const count = notificationsList.filter(n => !n.isRead).length;
    setUnreadCount(count);
  };

  const markAsRead = async (taskId) => {
    try {
      await api.patch(`/task/${taskId}/read`);
      setNotifications(prev => {
        const updated = prev.map(n => 
          n._id === taskId ? { ...n, isRead: true } : n
        );
        updateUnreadCount(updated);
        return updated;
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const addLocalNotification = (task) => {
    const notification = {
      ...task,
      _id: task._id || `temp-${Date.now()}`,
      isRead: false
    };
    
    setNotifications(prev => {
      const updated = [notification, ...prev].sort(
        (a, b) => new Date(a.reminderDate) - new Date(b.reminderDate)
      );
      updateUnreadCount(updated);
      return updated;
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      addLocalNotification,
      socket
    }}>
      {children}
    </NotificationContext.Provider>
  );
};