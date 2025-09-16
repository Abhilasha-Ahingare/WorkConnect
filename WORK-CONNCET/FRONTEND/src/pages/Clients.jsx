// src/pages/Clients.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "Lead" });
  const [editingId, setEditingId] = useState(null);

  const fetchClients = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/clients", { params });
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchClients(); }, [search, statusFilter]);

  const openCreate = () => { setEditingId(null); setForm({ name: "", email: "", phone: "", status: "Lead" }); setShowForm(true); };
  const openEdit = (c) => { setEditingId(c._id); setForm({ name: c.name, email: c.email, phone: c.phone, status: c.status }); setShowForm(true); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, form);
      } else {
        await api.post("/clients", form);
      }
      setShowForm(false);
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const removeClient = async (id) => {
    if (!confirm("Delete client?")) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <div className="flex gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name..." className="border p-2 rounded" />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border p-2 rounded">
            <option value="">All</option>
            <option value="Lead">Lead</option>
            <option value="In Progress">In Progress</option>
            <option value="Converted">Converted</option>
          </select>
          <button onClick={openCreate} className="bg-blue-500 text-white px-3 py-2 rounded">+ Add Client</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clients.map(c => (
          <div key={c._id} className="bg-white p-4 rounded-lg shadow">
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-gray-500">{c.email}</div>
            <div className="text-sm text-gray-500">{c.phone}</div>
            <div className="text-xs mt-2">{c.status}</div>
            <div className="flex gap-2 mt-3">
              <Link to={`/clients/${c._id}`} className="text-blue-600">View</Link>
              <button onClick={()=>openEdit(c)} className="text-yellow-600">Edit</button>
              <button onClick={()=>removeClient(c._id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-semibold mb-3">{editingId ? "Edit Client" : "Add Client"}</h3>
            <form onSubmit={submit} className="space-y-2">
              <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Name" className="w-full border p-2 rounded" />
              <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="w-full border p-2 rounded" />
              <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Phone" className="w-full border p-2 rounded" />
              <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="w-full border p-2 rounded">
                <option value="Lead">Lead</option>
                <option value="In Progress">In Progress</option>
                <option value="Converted">Converted</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={()=>setShowForm(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">{editingId ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
