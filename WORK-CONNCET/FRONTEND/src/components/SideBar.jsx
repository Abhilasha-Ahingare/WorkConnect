// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const menu = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/clients", label: "Clients" },
    { to: "/tasks", label: "Tasks" }
  ];

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">RealEstate CRM</h1>
        <p className="text-sm text-gray-300 mt-1">Reminders & Tasks</p>
      </div>

      <nav className="flex flex-col gap-2">
        {menu.map((m) => {
          const active = location.pathname.startsWith(m.to);
          return (
            <Link
              key={m.to}
              to={m.to}
              className={`px-4 py-2 rounded-lg block ${active ? "bg-blue-500" : "hover:bg-gray-800"}`}
            >
              {m.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
