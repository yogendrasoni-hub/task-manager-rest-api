import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TaskModal from './components/TaskModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import { createTask } from './api/tasks';

function DashboardLayout() {
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const handleGlobalCreateTask = async (taskData) => {
    try {
      setModalLoading(true);
      await createTask(taskData);
      setIsGlobalModalOpen(false);
      // Trigger a window event so active pages (Dashboard or Tasks) can refresh their list
      window.dispatchEvent(new CustomEvent('task:created'));
    } catch (err) {
      alert(err.message || 'Failed to create task');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onOpenNewTask={() => setIsGlobalModalOpen(true)} />
      <div className="app-container">
        <Sidebar onOpenNewTask={() => setIsGlobalModalOpen(true)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <TaskModal
        isOpen={isGlobalModalOpen}
        onClose={() => setIsGlobalModalOpen(false)}
        onSubmit={handleGlobalCreateTask}
        loading={modalLoading}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:id" element={<TaskDetailsPage />} />
            </Route>
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
