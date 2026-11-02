import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask, deleteTask } from '../api/tasks';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import TaskModal from '../components/TaskModal';
import DeleteModal from '../components/DeleteModal';

export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTask = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTaskById(id);
      setTask(data);
    } catch (err) {
      setError(err.message || 'Task not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!task) return;
    try {
      setActionLoading(true);
      const updated = await updateTask(task.id, { completed: !task.completed });
      setTask(updated);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (updates) => {
    try {
      setActionLoading(true);
      const updated = await updateTask(task.id, updates);
      setTask(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteTask(task.id);
      navigate('/tasks');
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-screen">
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="page-wrapper">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/tasks"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Tasks</span>
          </Link>
        </div>

        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error || 'Task not found or access denied.'}</span>
        </div>
      </div>
    );
  }

  const isCompleted = Boolean(task.completed);

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/tasks"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Tasks</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <span className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}>
            {isCompleted ? 'Completed' : 'Pending'}
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleToggleStatus}
              className={`btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
              disabled={actionLoading}
            >
              {isCompleted ? <Circle size={15} /> : <CheckCircle2 size={15} />}
              <span>{isCompleted ? 'Mark Pending' : 'Mark Completed'}</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-secondary btn-sm"
              disabled={actionLoading}
            >
              <Edit2 size={15} />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-danger btn-sm"
              disabled={actionLoading}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', wordBreak: 'break-word', color: 'var(--text-main)' }}>
          {task.title}
        </h1>

        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          lineHeight: 1.6,
          color: task.description ? 'var(--text-main)' : 'var(--text-muted)',
          whiteSpace: 'pre-wrap',
          minHeight: '100px'
        }}>
          {task.description || 'No description provided for this task.'}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Created At
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Calendar size={14} />
              {task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Last Updated
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Clock size={14} />
              {task.updated_at ? new Date(task.updated_at).toLocaleString() : 'N/A'}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Task ID
            </span>
            <span>#{task.id}</span>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSaveEdit}
        initialData={task}
        loading={actionLoading}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        taskTitle={task.title}
        loading={actionLoading}
      />
    </div>
  );
}
