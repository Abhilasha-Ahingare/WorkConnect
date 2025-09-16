// src/components/ClientsCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ClientsCard({ client, onEdit, onDelete }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between">
      <div>
        <div className="font-medium text-lg">{client.name}</div>
        <div className="text-sm text-gray-500">{client.email}</div>
        <div className="text-sm text-gray-500">{client.phone}</div>
        <div className="text-xs mt-1 text-gray-400">{client.status}</div>
      </div>
      <div className="flex gap-2 mt-3">
        <Link to={`/clients/${client._id}`} className="text-blue-600 text-sm">View</Link>
        <button onClick={() => onEdit(client)} className="text-yellow-600 text-sm">Edit</button>
        <button onClick={() => onDelete(client._id)} className="text-red-600 text-sm">Delete</button>
      </div>
    </div>
  );
};
