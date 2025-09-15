// src/contexts/NotificationContext.jsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import api from '../api/api';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // load existing upcoming notifications (today/tomorrow)
    const fetchUpcoming = async () => {
      try {
        const res = await api.get('/tasks/upcoming');
        // merge today + tomorrow sorted
        const merged = [...res.data.today, ...res.data.tomorrow]
          .sort((a,b) => new Date(a.reminderDate) - new Date(b.reminderDate));
        setNotifications(merged);
      } catch (err) {
        console.error('fetch upcoming', err);
      }
    };

    fetchUpcoming();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

    socket.on('connect', () => console.log('socket connected', socket.id));
    socket.on('new-reminder', (payload) => {
      // push new reminder to top, ensure date parsed
      setNotifications(prev => {
        const merged = [payload, ...prev];
        return merged.sort((a,b) => new Date(a.reminderDate) - new Date(b.reminderDate));
      });
    });

    return () => socket.disconnect();
  }, [user]);

  const markAsRead = async (taskId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/read`);
      setNotifications(prev => prev.map(n => n._id === taskId ? { ...n, isRead: true } : n));
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const addLocalNotification = (task) => {
    setNotifications(prev => [task, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, addLocalNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
