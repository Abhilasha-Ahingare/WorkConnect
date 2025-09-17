// UpcomingReminder.jsx (fixed)
import React from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertCircle, CheckCircle, User, Calendar } from "lucide-react";

const UpcomingReminders = ({ tasks = [], limit = 5 }) => {
  const sortedTasks = tasks
    .filter((task) => !task.isCompleted)
    .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))
    .slice(0, limit);

  if (sortedTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200"
      >
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-slate-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <p className="text-slate-600 font-medium">No upcoming reminders!</p>
        <p className="text-sm mt-1">You're all caught up</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {sortedTasks.map((task, index) => {
          const now = dayjs();
          const taskTime = dayjs(task.reminderDate);
          const diffMinutes = taskTime.diff(now, "minute");
          const isUrgent = diffMinutes <= 60 && diffMinutes >= 0;
          const isOverdue = now.isAfter(taskTime);

          // Create a stable unique key for each task
          const uniqueKey = task._id || `task-${index}`;

          return (
            <motion.div
              key={uniqueKey} // Use the stable key here
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                isOverdue
                  ? "bg-red-50 border-red-200"
                  : isUrgent
                  ? "bg-amber-50 border-amber-200"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Status indicator bar */}
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  isOverdue
                    ? "bg-red-500"
                    : isUrgent
                    ? "bg-amber-500"
                    : "bg-indigo-500"
                }`}
              ></div>

              <div className="flex items-start justify-between ml-2">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg mt-1 ${
                        isOverdue
                          ? "bg-red-100 text-red-600"
                          : isUrgent
                          ? "bg-amber-100 text-amber-600"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {task.assignedClients && task.assignedClients.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 ml-1">
                      <User className="h-3 w-3" />
                      <span>
                        Clients:{" "}
                        {task.assignedClients
                          .map((c) => c.name || c)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-400 ml-1">
                    <Calendar className="h-3 w-3" />
                    <span>{taskTime.format("MMM DD, YYYY [at] hh:mm A")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {" "}
                    {/* Add mode="wait" to fix nested AnimatePresence */}
                    {isOverdue ? (
                      <motion.span
                        key="overdue"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </motion.span>
                    ) : isUrgent && !isOverdue ? (
                      <motion.span
                        key="urgent"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        Soon
                      </motion.span>
                    ) : null}
                    {!task.isRead && (
                      <motion.div
                        key="unread"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-2 h-2 bg-indigo-500 rounded-full"
                      ></motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default UpcomingReminders;
