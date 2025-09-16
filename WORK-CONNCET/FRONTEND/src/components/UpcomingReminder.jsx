// src/components/UpcomingReminders.jsx
import React from "react";
import dayjs from "dayjs";

export default function UpcomingReminders({ tasks = [] }) {
  if (!tasks) return null;
  const filtered = tasks.filter(t => !t.isCompleted)
    .sort((a,b) => new Date(a.reminderDate) - new Date(b.reminderDate));

  return (
    <div className="space-y-2">
      {filtered.length === 0 && <div className="text-sm text-gray-500">No upcoming reminders</div>}
      {filtered.map(t => {
        const diffMin = dayjs(t.reminderDate).diff(dayjs(), "minute");
        const urgent = diffMin <= 60 && diffMin >= 0;
        return (
          <div key={t._id || t.id} className={`p-2 rounded-lg border flex justify-between items-center ${urgent ? "bg-red-50" : "bg-white"}`}>
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-gray-500">{t.assignedClients?.map(c => c.name).join(", ")}</div>
            </div>
            <div className="text-xs text-gray-500">{dayjs(t.reminderDate).format("DD MMM, hh:mm A")}</div>
          </div>
        );
      })}
    </div>
  );
}
