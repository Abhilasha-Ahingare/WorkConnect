// NotificationContext.jsx (updated with fixes)
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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
  const [newNotification, setNewNotification] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  // Enable audio on user interaction
  useEffect(() => {
    const enableAudio = () => {
      setAudioEnabled(true);
      document.removeEventListener('click', enableAudio);
    };
    
    document.addEventListener('click', enableAudio);
    
    return () => {
      document.removeEventListener('click', enableAudio);
    };
  }, []);

  // Initialize audio only once
  useEffect(() => {
    audioRef.current = new Audio("https://audio-previews.elements.envatousercontent.com/files/472198703/preview.mp3");
    audioRef.current.volume = 0.3;
    audioRef.current.load();
  }, []);

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
    
    const connectSocket = () => {
      const newSocket = io(socketURL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setIsConnecting(false);
        setConnectionError(null);
        const token = localStorage.getItem("token");
        if (token) {
          newSocket.emit("register", "user-id");
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnectionError("Failed to connect to notification service");
        setIsConnecting(false);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          // The server has disconnected, need to manually reconnect
          newSocket.connect();
        }
      });

      newSocket.on("new-reminder", (reminder) => {
        console.log("New reminder received:", reminder);
        
        // Play notification sound if audio is enabled
        if (audioEnabled && audioRef.current) {
          try {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => {
              console.log("Audio play failed:", e);
            });
          } catch (error) {
            console.error("Error playing audio:", error);
          }
        }
        
        // Show the mini reminder
        setNewNotification(reminder);
        
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Auto hide after 5 seconds
        timeoutRef.current = setTimeout(() => {
          setNewNotification(null);
        }, 5000);

        setNotifications((prev) => {
          const updated = [reminder, ...prev].sort(
            (a, b) => new Date(a.reminderDate) - new Date(b.reminderDate)
          );
          updateUnreadCount(updated);
          return updated;
        });
      });

      setSocket(newSocket);
      setIsConnecting(true);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        newSocket.disconnect();
      };
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [audioEnabled]); // Add audioEnabled as dependency

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

  const dismissMiniReminder = () => {
    setNewNotification(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        addLocalNotification,
        socket,
        isConnecting,
        connectionError,
        newNotification,
        dismissMiniReminder,
        audioEnabled
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};