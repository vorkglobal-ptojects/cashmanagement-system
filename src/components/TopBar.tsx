'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, ChevronDown, Building, ShieldCheck } from 'lucide-react';
import { AuthSession, AppNotification } from '@/lib/types';

interface TopBarProps {
  currentUser: AuthSession | null;
  onRoleSwitch: (username: string) => void;
  onLogout: () => void;
  selectedBranch: string;
  setSelectedBranch: (branchId: string) => void;
  branches: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const PRESET_PERSONAS = [
  { username: 'sanjay', label: 'Mr. Sanjay', role: 'Main Administrator', initials: 'MS', branch: 'All branches' },
  { username: 'manager_borella', label: 'Ayesha Silva', role: 'Branch Manager', initials: 'AS', branch: 'Borella' },
  { username: 'manager_office', label: 'Office Manager', role: 'Branch Manager', initials: 'OM', branch: 'Head Office' },
  { username: 'employee_borella', label: 'Nimal Perera', role: 'Branch Employee', initials: 'NP', branch: 'Borella' },
  { username: 'employee_homagama', label: 'Sunil Wickrama', role: 'Branch Employee', initials: 'SW', branch: 'Homagama' },
];

export default function TopBar({
  currentUser,
  onRoleSwitch,
  onLogout,
  selectedBranch,
  setSelectedBranch,
  branches,
  searchTerm,
  setSearchTerm,
}: TopBarProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const displayName = currentUser?.role === 'MAIN_ADMIN'
    ? 'Mr. Sanjay'
    : (currentUser?.firstName ? `${currentUser.firstName} ${currentUser?.lastName || ''}`.trim() : (currentUser?.username || 'User'));

  const roleLabel = currentUser?.role === 'MAIN_ADMIN'
    ? 'Main Administrator'
    : currentUser?.role === 'BRANCH_MANAGER'
    ? 'Branch Manager'
    : 'Branch Employee';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'MS';

  return (
    <header style={{
      height: '60px',
      background: '#ffffff',
      borderBottom: '1px solid #e8edf3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Search Input (Mockup style with ⌘ K) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '0.45rem 0.85rem',
        width: '320px',
      }}>
        <Search size={15} color="#94a3b8" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customers, transfers..."
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '0.82rem',
            width: '100%',
            color: '#0f172a',
            background: 'transparent',
          }}
        />
        <span style={{
          fontSize: '0.65rem',
          color: '#94a3b8',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '0.1rem 0.35rem',
          fontWeight: 600,
        }}>
          ⌘ K
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Branch Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Building size={14} color="#64748b" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="All">All 11 branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              padding: '0.3rem',
              color: '#475569',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#087f70',
              }} />
            )}
          </button>

          {isNotifOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '300px',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e8edf3',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              padding: '0.75rem',
              zIndex: 50,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.35rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#087f70', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{ fontSize: '0.75rem', padding: '0.45rem', borderRadius: '4px', background: n.isRead ? '#f8fafc' : '#e6f5f3' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{n.title}</div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Avatar & Switcher (Mockup style) */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#e2e8f0',
              color: '#1e293b',
              fontWeight: 700,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {initials}
            </div>

            <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {roleLabel}
              </div>
            </div>

            <ChevronDown size={14} color="#64748b" />
          </div>

          {/* Persona Switch Menu */}
          {isProfileOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '240px',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e8edf3',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              padding: '0.5rem',
              zIndex: 50,
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0.4rem 0.5rem' }}>
                Simulate Role
              </div>
              {PRESET_PERSONAS.map((p) => (
                <div
                  key={p.username}
                  onClick={() => {
                    onRoleSwitch(p.username);
                    setIsProfileOpen(false);
                  }}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    background: currentUser?.username === p.username ? '#e6f5f3' : 'transparent',
                    color: currentUser?.username === p.username ? '#087f70' : '#1e293b',
                    fontWeight: currentUser?.username === p.username ? 600 : 500,
                  }}
                >
                  <div>{p.label}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{p.role} • {p.branch}</div>
                </div>
              ))}

              <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.5rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#dc2626',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
