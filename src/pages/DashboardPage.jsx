import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTask, createTask } from '../api/tasks';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => Boolean(t.completed)).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleToggleComplete = async (taskId, newStatus) => {
    try {
      const updated = await updateTask(taskId, { completed: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: updated.completed } : t))
      );
    } catch (err) {
      setError(err.message || 'Failed to update task.');
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      setModalLoading(true);
      const created = await createTask(taskData);
      setTasks((prev) => [created, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name || 'User'} 👋</h1>
          <p className="page-subtitle">Here is your productivity overview for today</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadTasks}
            className="btn btn-secondary btn-sm"
            title="Refresh Tasks"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Real Statistics Grid */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <ListTodo size={24} />
          </div>
          <div>
            <div className="stat-value">{total}</div>
            <div className="stat-title">Total Tasks</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{pending}</div>
            <div className="stat-title">Pending</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{completed}</div>
            <div className="stat-title">Completed</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-title">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <span>Overall Progress</span>
          <span>{completed} of {total} completed ({completionRate}%)</span>
        </div>
        <div style={{
          height: '10px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${completionRate}%`,
            backgroundColor: completionRate === 100 ? 'var(--success)' : 'var(--primary)',
            transition: 'width 0.4s ease-out'
          }} />
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3>Recent Tasks</h3>
          {tasks.length > 0 && (
            <Link
              to="/tasks"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--primary)',
                textDecoration: 'none'
              }}
            >
              <span>View all tasks</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '200px' }}>
            <div className="spinner" style={{ width: '28px', height: '28px' }} />
            <p>Loading your dashboard...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ListTodo size={32} />
            </div>
            <h3>No tasks yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', maxWidth: '360px', margin: '0 auto 1.25rem' }}>
              You don't have any tasks in your workspace yet. Create your first task to start organizing your workflow.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              <PlusCircle size={18} />
              <span>Create First Task</span>
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.slice(0, 4).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={() => setIsModalOpen(true)}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        loading={modalLoading}
      />
    </div>
  );
}
