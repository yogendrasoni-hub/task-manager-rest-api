import React, { useState, useEffect, useMemo } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../api/tasks';
import {
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ListTodo
} from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import DeleteModal from '../components/DeleteModal';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | completed
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | title

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'completed') matchesStatus = Boolean(task.completed);
        if (statusFilter === 'pending') matchesStatus = !Boolean(task.completed);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [tasks, searchTerm, statusFilter, sortBy]);

  // Toggle complete
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

  // Submit create or edit
  const handleSaveTask = async (taskData) => {
    try {
      setModalLoading(true);
      if (editingTask) {
        const updated = await updateTask(editingTask.id, taskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? updated : t))
        );
      } else {
        const created = await createTask(taskData);
        setTasks((prev) => [created, ...prev]);
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setModalLoading(false);
    }
  };

  // Trigger edit
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Trigger delete confirmation
  const handleOpenDelete = (task) => {
    setDeletingTask(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setDeleteLoading(true);
      await deleteTask(deletingTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      setIsDeleteModalOpen(false);
      setDeletingTask(null);
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage, prioritize, and track your daily work</p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <PlusCircle size={18} />
          <span>New Task</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            {['all', 'pending', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="btn btn-sm"
                style={{
                  backgroundColor: statusFilter === status ? 'var(--bg-card)' : 'transparent',
                  color: statusFilter === status ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: statusFilter === status ? 'var(--shadow-sm)' : 'none',
                  textTransform: 'capitalize'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Sort:</span>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>

            <button
              onClick={loadTasks}
              className="btn btn-secondary btn-icon"
              title="Refresh"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinner' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Task List / Grid */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
          <p>Fetching your tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ListTodo size={32} />
          </div>
          {tasks.length === 0 ? (
            <>
              <h3>No tasks yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                You haven't created any tasks yet. Get started by clicking the button below.
              </p>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <PlusCircle size={18} />
                <span>Create First Task</span>
              </button>
            </>
          ) : (
            <>
              <h3>No matching tasks found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Try adjusting your search terms or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="btn btn-secondary btn-sm"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        loading={modalLoading}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={handleConfirmDelete}
        taskTitle={deletingTask?.title || ''}
        loading={deleteLoading}
      />
    </div>
  );
}
