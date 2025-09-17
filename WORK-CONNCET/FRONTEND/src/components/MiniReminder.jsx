import React, { useEffect, useState, useRef } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";

// Base64 encoded notification sound (short beep)
const NOTIFICATION_SOUND =
  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaATaM0+zPfC4IJnLD9siBPAELcq3g16NHHQV2jdXo1TYHMKLXhyJGvOCJZWcn";

const MiniReminder = () => {
  const { newNotification, dismissMiniReminder, markAsRead } =
    useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // Enable audio on user interaction
  useEffect(() => {
    const enableAudio = () => {
      setAudioEnabled(true);
      if (!audioRef.current) {
        audioRef.current = new Audio(NOTIFICATION_SOUND);
        audioRef.current.volume = 0.4;
      }
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };

    document.addEventListener("click", enableAudio);
    document.addEventListener("touchstart", enableAudio);

    return () => {
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };
  }, []);

  // Check if reminder should trigger (1 minute before the set time)
  const shouldTriggerReminder = (reminderDate) => {
    const now = new Date();
    const reminder = new Date(reminderDate);
    const triggerTime = new Date(reminder.getTime() - 60000); // 1 minute before
    const endTime = new Date(reminder.getTime() + 300000); // 5 minutes after for safety

    console.log("Trigger Check:", {
      now: now.toLocaleTimeString(),
      reminder: reminder.toLocaleTimeString(),
      triggerTime: triggerTime.toLocaleTimeString(),
      shouldShow: now >= triggerTime && now <= endTime,
    });

    return now >= triggerTime && now <= endTime;
  };

  // Set up interval to check for reminders periodically
  useEffect(() => {
    const checkForReminders = () => {
      if (newNotification && newNotification.reminderDate) {
        console.log("Interval checking if should trigger...");
        const shouldShow = shouldTriggerReminder(newNotification.reminderDate);
        console.log("Should show:", shouldShow);

        if (shouldShow && !isVisible) {
          setIsVisible(true);
          console.log("Showing mini reminder!");

          // Play notification sound
          if (audioEnabled && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch((e) => console.log("Audio play failed:", e));
          }
        } else if (!shouldShow && isVisible) {
          setIsVisible(false);
        }
      } else if (!newNotification && isVisible) {
        setIsVisible(false);
      }
    };

    // Check immediately
    checkForReminders();
    
    // Set up interval to check every 30 seconds
    checkIntervalRef.current = setInterval(checkForReminders, 30000);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [newNotification, audioEnabled, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => dismissMiniReminder(), 250);
  };

  const handleMarkAsRead = () => {
    if (newNotification?._id) {
      markAsRead(newNotification._id);
    }
    handleClose();
  };

  if (!newNotification || !isVisible) return null;

  // Calculate time difference
  const now = new Date();
  const reminderDate = new Date(newNotification.reminderDate);
  const diffMinutes = Math.abs(now - reminderDate) / (1000 * 60);
  const isOverdue = now > reminderDate;
  const isUrgent = diffMinutes <= 1; // Within 1 minute

  const formatTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={newNotification._id}
        initial={{ opacity: 0, x: 400, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 400, scale: 0.9 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.5,
        }}
        className="fixed top-20 right-4 z-[9999] w-80 overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100"
        style={{
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)",
        }}
      >
        {/* Compact Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="p-1.5 bg-white/20 rounded-lg"
              >
                {isOverdue ? <AlertCircle size={16} /> : <Clock size={16} />}
              </motion.div>
              <div>
                <h3 className="text-sm font-bold">
                  {isOverdue
                    ? "⚠️ Overdue"
                    : isUrgent
                    ? "🔔 Reminder"
                    : "📅 Upcoming"}
                </h3>
                <p className="text-xs text-white/80">
                  {formatTime(newNotification.reminderDate)}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-white/90 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              aria-label="Close reminder"
            >
              <X size={16} />
            </motion.button>
          </div>
        </div>

        {/* Compact Content */}
        <div className="p-4 space-y-3">
          {/* Task Info */}
          <div>
            <motion.h4
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-bold text-gray-800 text-sm mb-1"
            >
              {newNotification.title}
            </motion.h4>
            {newNotification.description && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs text-gray-600 line-clamp-2"
              >
                {newNotification.description}
              </motion.p>
            )}
          </div>

          {/* Client Info - Compact */}
          {newNotification.assignedClients &&
            newNotification.assignedClients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100"
              >
                <div className="flex items-center gap-1 mb-1">
                  <User className="h-3 w-3 text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-700">
                    Clients ({newNotification.assignedClients.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newNotification.assignedClients
                    .slice(0, 3)
                    .map((client, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {client.name || client}
                      </span>
                    ))}
                  {newNotification.assignedClients.length > 3 && (
                    <span className="text-xs text-indigo-600 font-medium">
                      +{newNotification.assignedClients.length - 3} more
                    </span>
                  )}
                </div>
              </motion.div>
            )}

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                isOverdue
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : isUrgent
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}
            >
              <Clock size={10} />
              {isOverdue
                ? `${Math.round(diffMinutes)}m overdue`
                : isUrgent
                ? "Due now"
                : "On schedule"}
            </div>
          </motion.div>

          {/* Action Buttons - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 pt-1"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Later
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAsRead}
              className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-lg"
            >
              <CheckCircle size={12} />
              Complete
            </motion.button>
          </motion.div>
        </div>

        {/* Subtle glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniReminder;