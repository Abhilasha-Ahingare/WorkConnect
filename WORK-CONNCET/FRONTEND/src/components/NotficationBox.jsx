// src/components/NotificationBox.jsx
import React, { useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import dayjs from "dayjs";

export default function NotificationBox() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  // sort ascending by time
  const sorted = [...notifications].sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full bg-white shadow hover:scale-105 transition-transform"
        aria-label="Notifications"
      >
        {/* simple bell icon (replace with react-icon if you want) */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-2 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg border p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Notifications</h4>
            <button onClick={() => setOpen(false)} className="text-xs text-gray-500">Close</button>
          </div>

          <div className="max-h-80 overflow-auto space-y-2">
            {sorted.length === 0 && <div className="text-sm text-gray-500">No notifications 🎉</div>}

            {sorted.map((n) => {
              const isUrgent = dayjs(n.reminderDate).diff(dayjs(), "minute") < 60; // < 1 hour
              return (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`p-2 rounded-lg cursor-pointer flex justify-between items-start gap-3 transition-colors
                    ${n.isRead ? "bg-gray-50 opacity-75" : isUrgent ? "bg-red-50" : "bg-blue-50"}
                  `}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">{n.title || n.message}</div>
                      {n.assignedClients?.length > 0 && (
                        <div className="text-xs text-gray-500">• {n.assignedClients.map(c => c.name).join(", ")}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{n.message && n.message !== n.title ? n.message : ""}</div>
                    <div className="text-xs text-gray-400 mt-1">{dayjs(n.reminderDate).format("DD MMM, hh:mm A")}</div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    {!n.isRead ? (
                      <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">New</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Read</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
