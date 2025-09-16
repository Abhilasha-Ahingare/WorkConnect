import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <main className="pt-20 px-6 pb-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

