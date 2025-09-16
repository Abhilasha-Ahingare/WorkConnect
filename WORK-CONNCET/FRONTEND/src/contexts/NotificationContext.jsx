import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/api";
import dayjs from "dayjs";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Load initial notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.get("/task/upcoming");
        const allTasks = [
          ...(response.data.today || []),
          ...(response.data.tomorrow || []),
        ];
        setNotifications(allTasks);
        updateUnreadCount(allTasks);
        setConnectionError(null);
      } catch (error) {
        console.error("Failed to load notifications:", error);
        setConnectionError(
          "Failed to load notifications. Please check your connection."
        );
      }
    };

    loadNotifications();
  }, []);

  // Socket connection
  useEffect(() => {
    const socketURL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    let retryCount = 0;
    const maxRetries = 3;

    const connectSocket = () => {
      if (retryCount >= maxRetries) {
        console.warn("Max WebSocket connection retries reached");
        return;
      }

      const newSocket = io(socketURL, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setIsConnecting(false);
        setConnectionError(null);
        const token = localStorage.getItem("token");
        if (token) {
          newSocket.emit("register", "user-id"); // You can extract user ID from token
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnectionError("Failed to connect to notification service");
        retryCount++;
        setTimeout(connectSocket, 2000); // Retry after 2 seconds
      });

      newSocket.on("new-reminder", (reminder) => {
        setNotifications((prev) => {
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
    };

    setIsConnecting(true);
    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const updateUnreadCount = (notificationsList) => {
    const count = notificationsList.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  };

  const markAsRead = async (taskId) => {
    try {
      await api.patch(`/task/${taskId}/read`);
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n._id === taskId ? { ...n, isRead: true } : n
        );
        updateUnreadCount(updated);
        return updated;
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const addLocalNotification = (task) => {
    const notification = {
      ...task,
      _id: task._id || `temp-${Date.now()}`,
      isRead: false,
    };

    setNotifications((prev) => {
      const updated = [notification, ...prev].sort(
        (a, b) => new Date(a.reminderDate) - new Date(b.reminderDate)
      );
      updateUnreadCount(updated);
      return updated;
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        addLocalNotification,
        socket,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
