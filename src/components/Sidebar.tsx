'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  CheckSquare, 
  Users, 
  ArrowRightLeft, 
  BarChart3, 
  ShieldCheck, 
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { AuthSession } from '@/lib/types';

interface SidebarProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  currentUser: AuthSession | null;
  pendingCount: number;
  paymentCount: number;
  verifyCount: number;
}

export default function Sidebar({
  currentScreen,
  setCurrentScreen,
  currentUser,
  pendingCount,
  paymentCount,
  verifyCount,
}: SidebarProps) {
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

  return (
    <aside style={{
      width: '240px',
      background: '#132644', // User mockup deep navy
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
      padding: '1.25rem 1rem',
      userSelect: 'none',
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
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <ShieldCheck size={16} color="#38bdf8" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
          {portalTitle}
        </span>
      </div>

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

      {/* Bottom Access Box (Mockup style) */}
      <div style={{
        marginTop: 'auto',
        background: '#0f2038',
        borderRadius: '8px',
        padding: '0.85rem',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.75rem',
        color: '#94a3b8',
      }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
          YOUR ACCESS
        </div>
        <div style={{ fontWeight: 600, color: '#ffffff', marginTop: '0.2rem' }}>
          {isAdmin ? 'Company-wide oversight' : `${currentUser?.branchId || 'Branch'} oversight`}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>
          {isAdmin ? '11 branches • All operations' : 'Active branch staff'}
        </div>

        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', cursor: 'pointer' }}>
            <HelpCircle size={13} />
            <span>Help &amp; support</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.7rem', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
