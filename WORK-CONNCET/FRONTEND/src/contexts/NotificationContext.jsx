import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "../api/api";
import dayjs from "dayjs";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
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
  const intervalRef = useRef(null);

  // Enable audio on user interaction
  useEffect(() => {
    const enableAudio = () => {
      setAudioEnabled(true);
      // Create audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.volume = 0.5;
        audioRef.current.preload = "auto";
        
        // Use a simple beep sound data URL (works without external files)
        audioRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaATaM0+zPfC4IJnLD9siBPAELcq3g16NHHQV2jdXo1TYHMKLXhyJGvOCJZWcn";
      }
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
    
    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    
    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
  }, []);

  // Load initial notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  // Socket connection
  useEffect(() => {
    initializeSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Check for due reminders every minute
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      checkDueReminders();
    }, 60000); // Check every minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [notifications]);

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
      setConnectionError("Failed to load notifications");
    }
  };

  const initializeSocket = () => {
    const socketURL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    
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
      
      // Register user for notifications
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          newSocket.emit("register", payload.id);
        } catch (e) {
          console.error("Failed to parse token:", e);
        }
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnectionError("Connection failed");
      setIsConnecting(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    newSocket.on("new-reminder", (reminder) => {
      console.log("New reminder received:", reminder);
      handleNewReminder(reminder);
    });

    setSocket(newSocket);
    setIsConnecting(true);
  };

  const checkDueReminders = () => {
  const now = dayjs();

  notifications.forEach((task) => {
    if (task.isCompleted || task.isNotified) return;

    const taskTime = dayjs(task.reminderDate);
    const diffSeconds = taskTime.diff(now, "second");

    // ✅ Trigger reminder 5 sec before task time
    if (diffSeconds <= 5 && diffSeconds >= 0) {
      handleNewReminder(task);

      // Mark as notified
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === task._id ? { ...n, isNotified: true } : n
        )
      );
    }
  });
};


  const handleNewReminder = (reminder) => {
    // Play notification sound
    playNotificationSound();
    
    // Show mini reminder
    setNewNotification(reminder);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Auto hide after 8 seconds if user doesn't interact
    timeoutRef.current = setTimeout(() => {
      setNewNotification(null);
    }, 8000);

    // Add to notifications list if it's not already there
    setNotifications((prev) => {
      const exists = prev.some(n => n._id === reminder._id);
      if (exists) {
        return prev.map(n => 
          n._id === reminder._id ? { ...n, ...reminder, isNotified: true } : n
        );
      } else {
        const updated = [{ ...reminder, isNotified: true }, ...prev];
        updateUnreadCount(updated);
        return updated;
      }
    });
  };

  const playNotificationSound = () => {
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
  };

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
      
      // Clear mini reminder if it's the same task
      if (newNotification && newNotification._id === taskId) {
        setNewNotification(null);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const addLocalNotification = (task) => {
    const notification = {
      ...task,
      _id: task._id || `temp-${Date.now()}`,
      isRead: false,
      isNotified: false
    };

    setNotifications((prev) => {
      // Check if notification already exists
      const exists = prev.some(n => n._id === notification._id);
      if (exists) return prev;
      
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
        audioEnabled,
        loadNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};