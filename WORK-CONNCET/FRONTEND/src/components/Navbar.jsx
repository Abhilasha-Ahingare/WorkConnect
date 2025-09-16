// src/components/Navbar.jsx
import React from "react";
import NotificationBox from "./NotificationBox";

export default function Navbar() {
  return (
    <header className="fixed left-64 right-0 top-0 h-16 bg-white border-b z-40 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold">Welcome back</h2>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBox />
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/40" alt="avatar" className="w-9 h-9 rounded-full border" />
          <div>
            <div className="text-sm font-medium">Rinky</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
