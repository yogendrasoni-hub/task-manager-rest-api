import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm, taskTitle, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ color: 'var(--text-main)' }}>Delete Task</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Are you sure you want to delete this task?
          </p>
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontWeight: 600,
            fontSize: '0.9375rem',
            marginBottom: '0.75rem',
            wordBreak: 'break-word'
          }}>
            "{taskTitle}"
          </div>
          <p style={{ color: 'var(--danger)', fontSize: '0.8125rem' }}>
            This action is permanent and cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Deleting...</span>
              </>
            ) : (
              'Yes, Delete Task'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
