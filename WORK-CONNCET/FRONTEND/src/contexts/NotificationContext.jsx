// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/api";
import dayjs from "dayjs";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]); // array of task objects
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  // load initial upcoming (today + tomorrow) from backend
  useEffect(() => {
    const loadUpcoming = async () => {
      try {
        const res = await api.get("/tasks/upcoming");
        const merged = [...(res.data.today || []), ...(res.data.tomorrow || [])]
          .map((t) => ({ ...t, time: t.reminderDate || t.time || t.reminderDate }))
          .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
        setNotifications(merged);
        setUnreadCount(merged.filter((n) => !n.isRead).length);
      } catch (err) {
        // non-fatal: backend might be protected; handle gracefully
        console.error("Failed to load upcoming reminders:", err?.response?.data || err.message);
      }
    };

    loadUpcoming();
  }, []);

  // connect socket (after app mounts). If you want to join per-user room, emit auth token or join event.
  useEffect(() => {
    const s = io(SOCKET_URL, {
      // optional auth if backend expects it:
      // auth: { token: localStorage.getItem('token') }
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"]
    });

    setSocket(s);

    s.on("connect", () => {
      setSocketConnected(true);
      // optional: console.log("socket connected:", s.id);
    });

    // listen for server emitted reminders
    s.on("new-reminder", (payload) => {
      // normalize payload fields (support both `reminderDate` and `time`)
      const reminder = {
        _id: payload._id || payload.id,
        title: payload.title || payload.name || "Reminder",
        message: payload.title || payload.description || payload.message || "You have a reminder",
        reminderDate: payload.reminderDate || payload.time || payload.reminderDate,
        assignedClients: payload.assignedClients || payload.clients || [],
        isRead: payload.isRead || false,
        raw: payload
      };

      setNotifications((prev) => {
        const merged = [reminder, ...prev].sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
        setUnreadCount(merged.filter((n) => !n.isRead).length);
        return merged;
      });
    });

    s.on("disconnect", () => {
      setSocketConnected(false);
    });

    s.on("connect_error", (err) => {
      console.warn("Socket connect error:", err?.message || err);
    });

    return () => {
      s.disconnect();
      setSocket(null);
      setSocketConnected(false);
    };
  }, []);

  const markAsRead = async (taskId) => {
    try {
      // call backend to persist read state
      await api.patch(`/tasks/${taskId}/read`);
      setNotifications((prev) => {
        const updated = prev.map((n) => (n._id === taskId ? { ...n, isRead: true } : n));
        setUnreadCount(updated.filter((n) => !n.isRead).length);
        return updated;
      });
    } catch (err) {
      // still update locally so UI responds quickly
      setNotifications((prev) => {
        const updated = prev.map((n) => (n._id === taskId ? { ...n, isRead: true } : n));
        setUnreadCount(updated.filter((n) => !n.isRead).length);
        return updated;
      });
      console.error("markAsRead error:", err?.response?.data || err.message);
    }
  };

  const addLocalNotification = (task) => {
    // task must contain reminderDate (ISO) and _id (or generate temp id)
    const reminder = {
      _id: task._id || `local-${Date.now()}`,
      title: task.title || task.name || "Reminder",
      message: task.description || task.title || "Reminder created",
      reminderDate: task.reminderDate || task.time,
      assignedClients: task.assignedClients || [],
      isRead: false,
      raw: task
    };
    setNotifications((prev) => {
      const merged = [reminder, ...prev].sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
      setUnreadCount(merged.filter((n) => !n.isRead).length);
      return merged;
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      addLocalNotification,
      socket,
      socketConnected
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
