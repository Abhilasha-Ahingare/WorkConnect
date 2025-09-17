import React, { useEffect, useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { AnimatePresence, motion } from "framer-motion";
import { X, Clock, AlertCircle, CheckCircle } from "lucide-react";

const MiniReminder = () => {
  const { newNotification, dismissMiniReminder, markAsRead } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);

  // Show when new notification comes
  useEffect(() => {
    if (newNotification) {
      setIsVisible(true);

      // Auto hide after 2 minutes
      const timer = setTimeout(() => {
        setIsVisible(false);
        dismissMiniReminder();
      }, 120000);

      return () => clearTimeout(timer);
    }
  }, [newNotification]);

  const handleClose = () => {
    setIsVisible(false);
    dismissMiniReminder();
  };

  const handleMarkAsRead = () => {
    if (newNotification?._id) {
      markAsRead(newNotification._id);
    }
    handleClose();
  };

  if (!newNotification || !isVisible) return null;

  const now = new Date();
  const reminderDate = new Date(newNotification.reminderDate);
  const diffMinutes = Math.abs(now - reminderDate) / (1000 * 60);
  const isOverdue = now > reminderDate;
  const isUrgent = diffMinutes <= 1;

  const formatTime = (date) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={newNotification._id}
        initial={{ opacity: 0, x: 400, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 400, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.5 }}
        className="fixed top-20 right-4 z-[9999] w-80 rounded-2xl bg-white shadow-xl border border-gray-100"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isOverdue ? <AlertCircle size={16} /> : <Clock size={16} />}
            <div>
              <h3 className="text-sm font-bold">
                {isOverdue ? "⚠️ Overdue" : isUrgent ? "🔔 Reminder" : "📅 Upcoming"}
              </h3>
              <p className="text-xs text-white/80">
                {formatTime(newNotification.reminderDate)}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="hover:bg-white/10 rounded-lg p-1">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <h4 className="font-bold text-gray-800 text-sm">{newNotification.title}</h4>
          {newNotification.description && (
            <p className="text-xs text-gray-600">{newNotification.description}</p>
          )}

          {/* Status */}
          <div className="flex justify-center">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                isOverdue
                  ? "bg-red-100 text-red-800"
                  : isUrgent
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              <Clock size={10} />
              {isOverdue
                ? `${Math.round(diffMinutes)}m overdue`
                : isUrgent
                ? "Due now"
                : "On schedule"}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Later
            </button>
            <button
              onClick={handleMarkAsRead}
              className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center gap-1"
            >
              <CheckCircle size={12} /> Complete
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniReminder;
