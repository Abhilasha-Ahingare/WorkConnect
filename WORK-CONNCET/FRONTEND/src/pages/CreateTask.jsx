// src/pages/CreateTask.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNotifications } from "../contexts/NotificationContext";

export default function CreateTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dateTime, setDateTime] = useState("");
  const { addLocalNotification } = useNotifications();

  useEffect(() => {
    api.get("/clients").then(res => setClients(res.data)).catch(console.error);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!title || selected.length === 0 || !dateTime) return alert("Please fill all");
    // convert local datetime-local to ISO (assume browser returns local)
    const iso = new Date(dateTime).toISOString();
    const body = { title, description, assignedClients: selected, reminderDate: iso };
    try {
      const res = await api.post("/tasks", body);
      // optimistic UI
      addLocalNotification(res.data || { ...body, _id: res.data?._id });
      alert("Task created");
      setTitle(""); setDescription(""); setSelected([]); setDateTime("");
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-2xl">
      <h3 className="font-semibold mb-3">Create Task</h3>
      <form onSubmit={submit} className="space-y-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full border p-2 rounded" required />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full border p-2 rounded" />
        <select multiple value={selected} onChange={e=>setSelected(Array.from(e.target.selectedOptions, o=>o.value))} className="w-full border p-2 rounded">
          {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.status})</option>)}
        </select>
        <input type="datetime-local" value={dateTime} onChange={e=>setDateTime(e.target.value)} className="w-full border p-2 rounded" required />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Create</button>
        </div>
      </form>
    </div>
  );
}
