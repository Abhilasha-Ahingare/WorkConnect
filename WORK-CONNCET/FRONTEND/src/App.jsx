import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Registerations";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";
import Tasks from "./pages/Tasks";
// import CreateTask from "./pages/CreateTask";
import Layout from "./components/layout";
// import ProtectedRoute from "./components/ProtectedRoutes";
import { useAuth } from "./contexts/AuthContext";
import CreateTaskModal from "./pages/CreateTask";
import MiniReminder from "./components/MiniReminder";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            // <ProtectedRoute>
            <Layout />
            // </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard>
                <MiniReminder />
              </Dashboard>
            }
          />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/task" element={<Tasks />} />
          <Route path="/task/create-task" element={<CreateTaskModal />} />
        </Route>

        {/* Fallback Route */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
      {/* <MiniReminder /> */}
    </>
  );
}
