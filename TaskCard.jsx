import React from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Circle, Clock, Edit2, ExternalLink, Trash2 } from 'lucide-react';

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }) {
  const isCompleted = Boolean(task.completed);

  const formattedDate = task.created_at
    ? new Date(task.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  return (
    <div className={`card task-card ${isCompleted ? 'completed' : ''}`}>
      <div className="task-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => onToggleComplete(task.id, !isCompleted)}
            className="btn btn-ghost btn-icon"
            style={{
              padding: '0.25rem',
              color: isCompleted ? 'var(--success)' : 'var(--text-light)',
              flexShrink: 0,
              marginTop: '0.125rem'
            }}
            title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          >
            {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>

          <Link
            to={`/tasks/${task.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
            title="View Task Details"
          >
            <h4 className="task-title">{task.title}</h4>
          </Link>
        </div>

        <span className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`}>
          {isCompleted ? 'Completed' : 'Pending'}
        </span>
      </div>

      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      <div className="task-footer">
        <span className="task-date">
          <Clock size={13} />
          <span>{formattedDate}</span>
        </span>

        <div className="task-actions">
          <Link
            to={`/tasks/${task.id}`}
            className="btn btn-ghost btn-icon"
            title="View Details"
            style={{ color: 'var(--text-muted)' }}
          >
            <ExternalLink size={15} />
          </Link>

          <button
            onClick={() => onEdit(task)}
            className="btn btn-ghost btn-icon"
            title="Edit Task"
            style={{ color: 'var(--primary)' }}
          >
            <Edit2 size={15} />
          </button>

          <button
            onClick={() => onDelete(task)}
            className="btn btn-ghost btn-icon"
            title="Delete Task"
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
