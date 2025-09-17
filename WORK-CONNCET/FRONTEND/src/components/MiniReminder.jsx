import React, { useEffect, useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { AnimatePresence, motion } from "framer-motion";
import { X, Clock, AlertCircle } from "lucide-react";
import dayjs from "dayjs";

const MiniReminder = () => {
  const { newNotification, dismissMiniReminder, markAsRead } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newNotification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => dismissMiniReminder(), 300);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [newNotification, dismissMiniReminder]);

  if (!newNotification || !isVisible) return null;

  const isOverdue = dayjs().isAfter(dayjs(newNotification.reminderDate));
  const diffMinutes = dayjs(newNotification.reminderDate).diff(dayjs(), "minute");
  const isUrgent = diffMinutes <= 60;

  const headerColor = isOverdue
    ? "bg-destructive text-destructive-foreground"
    : isUrgent
    ? "bg-accent text-accent-foreground"
    : "bg-primary text-primary-foreground";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ type: "spring", damping: 22, stiffness: 240 }}
          className="fixed bottom-4 right-4 z-[60] w-80 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xl"
          role="dialog"
          aria-live="assertive"
        >
          <div className={`px-4 py-3 ${headerColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOverdue ? <AlertCircle size={18} /> : <Clock size={18} />}
                <h3 className="text-sm font-semibold">
                  {isOverdue ? "Overdue Reminder" : isUrgent ? "Upcoming Reminder" : "New Reminder"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => dismissMiniReminder(), 250);
                }}
                className="opacity-90 transition-opacity hover:opacity-100"
                aria-label="Close reminder"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-3 px-4 py-4">
            <div>
              <p className="text-sm font-medium">{newNotification.title}</p>
              {newNotification.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{newNotification.description}</p>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{dayjs(newNotification.reminderDate).format("DD MMM, hh:mm A")}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    markAsRead(newNotification.id);
                    setIsVisible(false);
                    setTimeout(() => dismissMiniReminder(), 250);
                  }}
                  className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:opacity-90"
                >
                  Mark read
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniReminder;
