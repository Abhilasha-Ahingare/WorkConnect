import React, { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import dayjs from 'dayjs';

export default function NotificationBox() {
  const { notifications, markAsRead } = useContext(NotificationContext);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button className="p-2 rounded-full bg-gray-100">
        🔔
        {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">{unreadCount}</span>}
      </button>

      {/* dropdown list */}
      <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded p-2 z-50">
        <h4 className="font-semibold mb-2">Upcoming Reminders</h4>
        {notifications.length === 0 && <div className="text-sm text-gray-500">No reminders</div>}
        <div className="space-y-2 max-h-72 overflow-auto">
          {notifications.map(n => (
            <div key={n._id} className={`p-2 rounded border ${n.isRead ? 'opacity-60' : 'bg-white'}`}>
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-gray-600">{n.description}</div>
                  <div className="text-xs text-gray-500">{dayjs(n.reminderDate).format('DD MMM, hh:mm A')}</div>
                </div>
                <div className="ml-2 text-right">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
                    >Mark read</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
