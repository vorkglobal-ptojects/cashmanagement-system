'use client';

import React from 'react';
import { 
  Building2, 
  ArrowLeftRight, 
  Wallet, 
  BookOpen, 
  ShieldCheck, 
  LogOut, 
  UserCheck, 
  Coins 
} from 'lucide-react';
import { AuthSession, UserRole } from '@/lib/types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: AuthSession | null;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
}

const ROLES: { role: UserRole; label: string; branch: string }[] = [
  { role: 'FINANCE_ADMIN', label: 'Finance Director (HO)', branch: 'HQ' },
  { role: 'SYSTEM_ADMIN', label: 'System Administrator', branch: 'All Branches' },
  { role: 'BRANCH_MANAGER', label: 'Branch Manager (Borella)', branch: 'BRL' },
  { role: 'CASHIER', label: 'Cashier / Teller (Borella)', branch: 'BRL' },
  { role: 'DISPATCHER', label: 'Cash Custodian / Dispatcher', branch: 'HQ' },
  { role: 'RECEIVING_OFFICER', label: 'Receiving Officer (Borella)', branch: 'BRL' },
  { role: 'AUDITOR', label: 'Auditor (Read-Only)', branch: 'Consolidated' },
];

export default function Navbar({
  currentTab,
  setCurrentTab,
  currentUser,
  onRoleSwitch,
  onLogout,
}: NavbarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'transfers', label: 'Cash Transfers', icon: ArrowLeftRight },
    { id: 'tills', label: 'Till & Reconcile', icon: Wallet },
    { id: 'ledger', label: 'General Ledger', icon: BookOpen },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 15, 29, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand & System Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}>
            <Coins size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              Cash Management System
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Multi-Branch Vault, Till & Transport Operations
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
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isActive ? 'var(--primary-emerald)' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid var(--primary-emerald)' : '2px solid transparent',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active Role & Interactive Impersonator Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <UserCheck size={16} color="var(--primary-emerald)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                Simulate Role:
              </span>
              <select
                value={currentUser?.role || 'FINANCE_ADMIN'}
                onChange={(e) => onRoleSwitch(e.target.value as UserRole)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {ROLES.map((r) => (
                  <option key={r.role} value={r.role} style={{ background: '#111827', color: '#fff' }}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            {currentUser?.branchId && (
              <span style={{
                background: 'rgba(6, 182, 212, 0.2)',
                color: '#06b6d4',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
              }}>
                {currentUser.branchId}
              </span>
            )}
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
