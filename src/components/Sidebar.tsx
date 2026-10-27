'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  CheckSquare, 
  Users, 
  ArrowRightLeft, 
  BarChart3, 
  ShieldCheck, 
  HelpCircle,
  FileCheck2,
  LogOut,
  ChevronUp,
  Building,
  UserCheck
} from 'lucide-react';
import { AuthSession } from '@/lib/types';

interface SidebarProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  currentUser: AuthSession | null;
  pendingCount: number;
  paymentCount: number;
  verifyCount: number;
  onRoleSwitch?: (username: string) => void;
  onLogout?: () => void;
  selectedBranch?: string;
  setSelectedBranch?: (branch: string) => void;
  branches?: any[];
}

const PRESET_PERSONAS = [
  { username: 'sanjay', label: 'Mr. Sanjay', role: 'Main Administrator', branch: 'All 11 branches', initials: 'MS' },
  { username: 'manager_borella', label: 'Dhammika Senanayake', role: 'Branch Manager', branch: 'Borella', initials: 'DS' },
  { username: 'manager_office', label: 'Chamari Wickramasinghe', role: 'Branch Manager', branch: 'Head Office', initials: 'CW' },
  { username: 'manager_super', label: 'Sunil Fernandopulle', role: 'Branch Manager', branch: 'SUPER Branch', initials: 'SF' },
  { username: 'employee_borella', label: 'Kavindi Silva', role: 'Branch Employee', branch: 'Borella', initials: 'KS' },
  { username: 'employee_dehiwela', label: 'Niroshan Bandara', role: 'Branch Employee', branch: 'Dehiwela', initials: 'NB' },
  { username: 'employee_homagama', label: 'Saman Kumara', role: 'Branch Employee', branch: 'Homagama', initials: 'SK' },
];

export default function Sidebar({
  currentScreen,
  setCurrentScreen,
  currentUser,
  pendingCount,
  paymentCount,
  verifyCount,
  onRoleSwitch,
  onLogout,
  selectedBranch = 'All',
  setSelectedBranch,
  branches = [],
}: SidebarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isEmployee = currentUser?.role === 'BRANCH_EMPLOYEE';
  const isManager = currentUser?.role === 'BRANCH_MANAGER';
  const isAdmin = currentUser?.role === 'MAIN_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';

  // Navigation matching user's desktop mockups
  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: 'branches',
      label: 'Branches',
      icon: Building2,
      visible: isAdmin || isManager,
    },
    {
      id: 'approval-inbox',
      label: 'Approvals',
      icon: CheckSquare,
      badge: pendingCount,
      visible: isAdmin || isManager,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      visible: true,
    },
    {
      id: 'history',
      label: 'Transfers',
      icon: ArrowRightLeft,
      visible: true,
    },
    {
      id: 'receipts',
      label: 'Verifications',
      icon: FileCheck2,
      badge: verifyCount,
      visible: isAdmin || isManager,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      visible: isAdmin || isManager,
    },
  ];

  const portalTitle = isAdmin
    ? 'Administrator Portal'
    : isManager
    ? 'Manager Portal'
    : 'Employee Portal';

  const displayName = currentUser?.role === 'MAIN_ADMIN'
    ? 'Mr. Sanjay'
    : (currentUser?.firstName ? `${currentUser.firstName} ${currentUser?.lastName || ''}`.trim() : (currentUser?.username || 'User'));

  const roleLabel = currentUser?.role === 'MAIN_ADMIN'
    ? 'Main Administrator'
    : currentUser?.role === 'BRANCH_MANAGER'
    ? 'Branch Manager'
    : 'Branch Employee';

  const branchDisplay = currentUser?.branchName || currentUser?.branchId || (isAdmin ? 'All 11 branches' : 'Branch Staff');

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'US';

  return (
    <aside style={{
      width: '260px',
      background: '#132644', // User mockup deep navy
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
      padding: '1.25rem 1rem',
      userSelect: 'none',
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      {/* Brand Header */}
      <div style={{ marginBottom: '1.5rem', paddingLeft: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="Company Finance" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
              Company Finance
            </h1>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              BRANCH CASH MANAGEMENT
            </div>
          </div>
        </div>
      </div>

      {/* Role Portal Badge Box (Mockup style) */}
      <div style={{
        background: '#1a3258',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '0.65rem 0.85rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <ShieldCheck size={16} color="#38bdf8" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
          {portalTitle}
        </span>
      </div>

      {/* Branch Context Selector (inside sidebar for quick access) */}
      {setSelectedBranch && branches.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '0.45rem 0.75rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Building size={14} color="#38bdf8" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 600,
              width: '100%',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="All" style={{ background: '#132644', color: '#ffffff' }}>All 11 branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id} style={{ background: '#132644', color: '#ffffff' }}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0.35rem 0.75rem',
          marginBottom: '0.15rem',
        }}>
          WORKSPACE
        </div>

        {navItems.filter((i) => i.visible).map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#1f3860' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#162d4e';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon size={16} color={isActive ? '#38bdf8' : '#64748b'} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  background: '#087f70',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* USER PROFILE & LOGOUT SECTION DOCKED AT BOTTOM (Marked with Blue in Mockup) */}
      <div style={{ marginTop: 'auto', position: 'relative', paddingTop: '1rem' }}>
        {/* Floating Persona Switcher Menu */}
        {isProfileMenuOpen && onRoleSwitch && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            width: '100%',
            background: '#1a3258',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.4)',
            padding: '0.65rem',
            zIndex: 100,
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '0.35rem 0.5rem', letterSpacing: '0.05em' }}>
              Switch Persona (Simulate)
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '200px', overflowY: 'auto' }}>
              {PRESET_PERSONAS.map((p) => {
                const isSelected = currentUser?.username === p.username;
                return (
                  <button
                    key={p.username}
                    onClick={() => {
                      onRoleSwitch(p.username);
                      setIsProfileMenuOpen(false);
                    }}
                    style={{
                      padding: '0.45rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      border: 'none',
                      textAlign: 'left',
                      background: isSelected ? '#1f4879' : 'transparent',
                      color: isSelected ? '#38bdf8' : '#e2e8f0',
                      fontWeight: isSelected ? 700 : 500,
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#162d4e';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{p.label}</span>
                      {isSelected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }}></span>}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{p.role} • {p.branch}</div>
                  </button>
                );
              })}
            </div>

            {onLogout && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Card at Bottom of Sidebar */}
        <div
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          style={{
            background: isProfileMenuOpen ? '#1a3258' : '#0f2038',
            borderRadius: '10px',
            padding: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.65rem',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isProfileMenuOpen) e.currentTarget.style.backgroundColor = '#162d4e';
          }}
          onMouseLeave={(e) => {
            if (!isProfileMenuOpen) e.currentTarget.style.backgroundColor = '#0f2038';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            {/* Avatar Initials with Active Indicator */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#e2e8f0',
                color: '#132644',
                fontWeight: 800,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {initials}
              </div>
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '2px solid #0f2038',
              }} />
            </div>

            {/* Name and Role text */}
            <div style={{ minWidth: 0, overflow: 'hidden', textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {displayName}
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: '#94a3b8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {roleLabel} • {branchDisplay}
              </div>
            </div>
          </div>

          <ChevronUp size={15} color="#94a3b8" style={{
            transform: isProfileMenuOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }} />
        </div>
      </div>
    </aside>
  );
}
