// src/pages/Tasks.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import dayjs from "dayjs";
import { useNotifications } from "../contexts/NotificationContext";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const { addLocalNotification, markAsRead } = useNotifications();

  const load = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(()=>{ load(); }, []);

  const toggleComplete = async (taskId, isCompleted) => {
    try {
      await api.put(`/tasks/${taskId}`, { isCompleted: !isCompleted }); // adjust backend route
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (taskId) => {
    await markAsRead(taskId);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <a href="/tasks/create" className="bg-blue-500 text-white px-3 py-1 rounded">Create Task</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(t => {
          const diffMin = dayjs(t.reminderDate).diff(dayjs(), "minute");
          const isOverdue = dayjs().isAfter(dayjs(t.reminderDate));
          const isUrgent = diffMin <= 60 && diffMin >= 0;
          return (
            <div key={t._id} className={`p-4 rounded-lg border ${t.isRead ? "opacity-80" : ""} ${isOverdue ? "bg-red-50" : isUrgent ? "bg-yellow-50" : "bg-white"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-gray-500">{t.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{dayjs(t.reminderDate).format("DD MMM, hh:mm A")}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={()=>toggleComplete(t._id, t.isCompleted)} className="text-sm bg-green-500 text-white px-2 py-1 rounded">{t.isCompleted ? "Undo" : "Complete"}</button>
                  <button onClick={()=>handleMarkRead(t._id)} className="text-sm bg-blue-500 text-white px-2 py-1 rounded">Mark Read</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
