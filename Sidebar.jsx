import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, PlusCircle, Activity } from 'lucide-react';
import { checkApiHealth } from '../api/auth';

export default function Sidebar({ onOpenNewTask }) {
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    checkApiHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0
    }}>
      <div>
        <div style={{ padding: '0 0.5rem 1.25rem 0.5rem' }}>
          <button
            onClick={onOpenNewTask}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <PlusCircle size={18} />
            <span>Create Task</span>
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'var(--transition)'
            })}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'var(--transition)'
            })}
          >
            <CheckSquare size={18} />
            <span>All Tasks</span>
          </NavLink>
        </nav>
      </div>

      {/* Backend API Connection Indicator */}
      <div style={{
        padding: '0.75rem 0.875rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: apiOnline === true ? 'var(--success)' : apiOnline === false ? 'var(--danger)' : 'var(--warning)',
          boxShadow: apiOnline === true ? '0 0 6px var(--success)' : 'none'
        }} />
        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
          {apiOnline === true ? 'Backend: Online (5000)' : apiOnline === false ? 'Backend: Offline' : 'Connecting to API...'}
        </span>
      </div>
    </aside>
  );
}
