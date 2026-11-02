import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ onOpenNewTask }) {
  const { user, logout } = useAuth();

  return (
    <header style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      padding: '0.875rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Brand */}
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          textDecoration: 'none',
          color: 'var(--text-main)',
          fontWeight: 800,
          fontSize: '1.25rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckSquare size={20} />
          </div>
          <span>TaskFlow</span>
        </Link>

        {/* Right Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onOpenNewTask && (
            <button
              onClick={onOpenNewTask}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex' }}
            >
              + New Task
            </button>
          )}

          {/* User Profile Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user?.name || 'User'}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.email}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            title="Log Out"
            style={{ color: 'var(--danger)' }}
          >
            <LogOut size={16} />
            <span style={{ display: 'none', sm: 'inline' }}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
