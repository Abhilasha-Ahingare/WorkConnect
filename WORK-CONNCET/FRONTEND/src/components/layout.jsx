// src/components/Layout.jsx
import React from "react";
import Sidebar from "./SideBar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-8">{children}</main>
      </div>
    </div>
  );
}
