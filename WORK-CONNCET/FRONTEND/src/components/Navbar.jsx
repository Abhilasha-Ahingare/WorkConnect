import React from "react";
import { useAuth } from "../contexts/AuthContext";
import NotificationBox from "./NotificationBox";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="fixed left-64 right-0 top-0 h-16 bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="flex items-center justify-between h-full px-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {user?.Username || 'User'}!
          </h2>
          <p className="text-sm text-gray-500">Manage your clients and tasks</p>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBox />
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.Username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">
                {user?.Username || 'User'}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role || 'User'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;