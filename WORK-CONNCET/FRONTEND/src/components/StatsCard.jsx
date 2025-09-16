// src/components/StatsCard.jsx
import React from "react";

export default function StatsCard({ title, value, icon }) {
  return (
    <div className="bg-white shadow rounded-xl p-4 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
