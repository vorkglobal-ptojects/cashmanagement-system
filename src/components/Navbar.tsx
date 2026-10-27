'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ArrowLeftRight, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  Bell, 
  Check, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { AuthSession, UserRole, AppNotification } from '@/lib/types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: AuthSession | null;
  onRoleSwitch: (username: string) => void;
  onLogout: () => void;
  onOpenNewTransfer?: () => void;
  onOpenRegisterCustomer?: () => void;
}

const PRESET_PERSONAS = [
  { username: 'sanjay', label: 'Mr. Sanjay (Main Administrator)', role: 'MAIN_ADMIN', branch: 'All 11 Branches' },
  { username: 'manager_borella', label: 'Manager Borella', role: 'BRANCH_MANAGER', branch: 'BRL' },
  { username: 'manager_office', label: 'Manager Head Office', role: 'BRANCH_MANAGER', branch: 'OFFICE' },
  { username: 'manager_super', label: 'Manager SUPER Branch', role: 'BRANCH_MANAGER', branch: 'SUPER' },
  { username: 'manager_dehiwela', label: 'Manager Dehiwela', role: 'BRANCH_MANAGER', branch: 'DEH' },
  { username: 'employee_borella', label: 'Employee Borella', role: 'BRANCH_EMPLOYEE', branch: 'BRL' },
  { username: 'employee_homagama', label: 'Employee Homagama', role: 'BRANCH_EMPLOYEE', branch: 'HOM' },
  { username: 'employee_panadura', label: 'Employee Panadura', role: 'BRANCH_EMPLOYEE', branch: 'PAN' },
];

export default function Navbar({
  currentTab,
  setCurrentTab,
  currentUser,
  onRoleSwitch,
  onLogout,
}: NavbarProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'transfers', label: 'Fund Transfers', icon: ArrowLeftRight },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
  ];

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
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

  const markOneRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(10, 15, 29, 0.92)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.65rem 1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    }}>
      <div style={{
        maxWidth: '1520px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand & System Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
          }}>
            {/* User Uploaded Logo Icon */}
            <img 
              src="/logo.png" 
              alt="Centralized Branch Fund Transfer Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                Centralized Fund Transfer
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}>
                11 Branches Live
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              Direct-to-Customer Bank Transfers &amp; Interbranch Operations
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.2))' : 'transparent',
                  color: isActive ? '#34d399' : '#94a3b8',
                  boxShadow: isActive ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
                  borderBottom: isActive ? '2px solid #10b981' : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Persona Switcher, Notifications & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              style={{
                background: isNotifOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.55rem',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                background: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                padding: '1rem',
                zIndex: 100,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    In-App Notifications ({notifications.length})
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#34d399',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>
                      No notifications at this time
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markOneRead(n.id);
                          setCurrentTab('transfers');
                          setIsNotifOpen(false);
                        }}
                        style={{
                          padding: '0.65rem',
                          borderRadius: '8px',
                          background: n.isRead ? 'rgba(255, 255, 255, 0.03)' : 'rgba(16, 185, 129, 0.1)',
                          borderLeft: n.isRead ? '3px solid transparent' : '3px solid #10b981',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0.25rem 0 0 0', lineHeight: 1.3 }}>
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Persona Impersonator / Role Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '0.35rem 0.65rem',
          }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Switch User:
            </span>
            <select
              value={currentUser?.username || ''}
              onChange={(e) => onRoleSwitch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#34d399',
                fontSize: '0.825rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {PRESET_PERSONAS.map((p) => (
                <option key={p.username} value={p.username} style={{ background: '#111827', color: '#fff' }}>
                  {p.label} [{p.branch}]
                </option>
              ))}
            </select>
          </div>

          {/* Current User Badge & Logout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingLeft: '0.5rem',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                {currentUser?.role === 'MAIN_ADMIN' ? 'Mr. Sanjay' : `${currentUser?.firstName} ${currentUser?.lastName}`}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>
                {currentUser?.role} • {currentUser?.branchId || 'Head Office (All)'}
              </div>
            </div>

            <button
              onClick={onLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '0.55rem',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
