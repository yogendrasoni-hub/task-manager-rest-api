import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <HelpCircle size={32} />
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>404 - Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>

        <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%' }}>
          <Home size={18} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
