// src/pages/ClientProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import dayjs from "dayjs";
import CreateTaskModal from "../components/CreateTaskModal"; // we'll provide inline if needed

export default function ClientProfile() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/clients/${id}`);
        setClient(res.data.client || res.data); // depending on backend
        setTasks(res.data.tasks || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  return (
    <div className="space-y-4">
      {client ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <div className="font-bold text-lg">{client.name}</div>
            <div className="text-sm text-gray-500">{client.email}</div>
            <div className="text-sm text-gray-500">{client.phone}</div>
            <div className="text-xs mt-2">Status: {client.status}</div>
            <button onClick={()=>setShowModal(true)} className="mt-3 bg-blue-500 text-white px-3 py-1 rounded">+ Create Reminder</button>
          </div>

          <div className="col-span-2 bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Tasks for {client.name}</h3>
            <ul className="space-y-2">
              {tasks.length === 0 && <div className="text-sm text-gray-500">No tasks</div>}
              {tasks.map(t => (
                <li key={t._id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.description}</div>
                    <div className="text-xs text-gray-400">{dayjs(t.reminderDate).format("DD MMM, hh:mm A")}</div>
                  </div>
                  <div className="text-xs">{t.isCompleted ? "Done" : "Pending"}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : <div>Loading...</div>}

      {showModal && (
        <CreateTaskModal onClose={()=>setShowModal(false)} preselectedClientId={id} />
      )}
    </div>
  );
}
