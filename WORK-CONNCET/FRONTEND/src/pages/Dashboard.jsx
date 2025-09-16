// src/pages/Dashboard.jsx
import React from "react";
import { useNotifications } from "../contexts/NotificationContext";
import dayjs from "dayjs";

export default function Dashboard() {
  const { notifications } = useNotifications();

  // sort by time ascending
  const sorted = [...notifications].sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));

  const upcomingCount = sorted.length;
  // NOTE: You should fetch counts from API for accurate totalClients/totalTasks/completed
  const totalClients = "—"; // replace with API data
  const completedReminders = sorted.filter((s) => s.isRead).length;
  const totalTasks = "—"; // replace with API data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <div className="text-sm font-medium text-gray-500">Upcoming Tasks</div>
          <div className="text-2xl font-bold mt-2">{upcomingCount}</div>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <div className="text-sm font-medium text-gray-500">Total Clients</div>
          <div className="text-2xl font-bold mt-2">{totalClients}</div>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <div className="text-sm font-medium text-gray-500">Completed Reminders</div>
          <div className="text-2xl font-bold mt-2">{completedReminders}</div>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <div className="text-sm font-medium text-gray-500">Total Tasks</div>
          <div className="text-2xl font-bold mt-2">{totalTasks}</div>
        </div>
      </div>

      {/* Recent client box + upcoming list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Recent Client</h3>
          {/* Replace with API client data */}
          <div className="text-sm text-gray-600">No recent client loaded — fetch via /api/clients</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Upcoming Reminders</h3>

          {sorted.length === 0 ? (
            <div className="text-sm text-gray-500">No upcoming reminders 🎉</div>
          ) : (
            <ul className="space-y-3 max-h-72 overflow-y-auto">
              {sorted.slice(0, 6).map((n) => {
                const diffMin = dayjs(n.reminderDate).diff(dayjs(), "minute");
                const isUrgent = diffMin <= 60 && diffMin >= 0;
                return (
                  <li key={n._id} className={`p-3 rounded-lg border flex justify-between items-start ${n.isRead ? "opacity-70" : ""} ${isUrgent ? "bg-red-50" : ""}`}>
                    <div>
                      <div className="font-medium">{n.title || n.message}</div>
                      <div className="text-xs text-gray-500">{n.assignedClients?.map(c => c.name).join(", ")}</div>
                      <div className="text-xs text-gray-400 mt-1">{dayjs(n.reminderDate).format("DD MMM, hh:mm A")}</div>
                    </div>
                    <div className="text-xs">{isUrgent ? "Urgent" : ""}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
