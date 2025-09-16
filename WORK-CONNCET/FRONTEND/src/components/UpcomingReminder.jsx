import React from "react";
import dayjs from "dayjs";

const UpcomingReminders = ({ tasks = [], limit = 5 }) => {
  const sortedTasks = tasks
    .filter(task => !task.isCompleted)
    .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))
    .slice(0, limit);

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🎉</div>
        <p>No upcoming reminders!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => {
        const now = dayjs();
        const taskTime = dayjs(task.reminderDate);
        const diffMinutes = taskTime.diff(now, 'minute');
        const isUrgent = diffMinutes <= 60 && diffMinutes >= 0;
        const isOverdue = now.isAfter(taskTime);

        return (
          <div
            key={task._id}
            className={`p-4 rounded-lg border transition-all ${
              isOverdue 
                ? 'bg-red-50 border-red-200' 
                : isUrgent 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {task.description}
                  </p>
                )}
                {task.assignedClients && task.assignedClients.length > 0 && (
                  <p className="text-xs text-gray-500 mb-2">
                    Clients: {task.assignedClients.map(c => c.name || c).join(', ')}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {taskTime.format('MMM DD, YYYY [at] hh:mm A')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOverdue && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Overdue
                  </span>
                )}
                {isUrgent && !isOverdue && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Soon
                  </span>
                )}
                {!task.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpcomingReminders;