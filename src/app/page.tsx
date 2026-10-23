'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardView from '@/components/DashboardView';
import TransfersView from '@/components/TransfersView';
import TillsView from '@/components/TillsView';
import LedgerView from '@/components/LedgerView';
import AuditView from '@/components/AuditView';
import NewTransferModal from '@/components/NewTransferModal';
import { AuthSession, UserRole } from '@/lib/types';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

export default function CashManagementApp() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewTransferModalOpen, setIsNewTransferModalOpen] = useState(false);

  // Direct login form state (for manual credential login if desired)
  const [loginIdentifier, setLoginIdentifier] = useState('finance_admin');
  const [loginPassword, setLoginPassword] = useState('Admin@123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Authenticate / fetch session
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        // Auto sign-in as Finance Admin for instant zero-friction demonstration
        await performLogin('finance_admin', 'Admin@123');
      }
    } catch (err) {
      console.error('Session check error:', err);
    }
  };

  const performLogin = async (identifier: string, pass: string) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setCurrentUser(data.user);
      await loadMasterData();
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [branchesRes, accountsRes, transfersRes] = await Promise.all([
        fetch('/api/branches'),
        fetch('/api/accounts'),
        fetch('/api/transfers'),
      ]);

      if (branchesRes.ok) {
        const data = await branchesRes.json();
        setBranches(data.branches || []);
      }
      if (accountsRes.ok) {
        const data = await accountsRes.json();
        setAccounts(data.accounts || []);
      }
      if (transfersRes.ok) {
        const data = await transfersRes.json();
        setTransfers(data.transfers || []);
      }
    } catch (err) {
      console.error('Master data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMasterData();
    }
  }, [currentUser]);

  // Handle Role Switch from Navbar
  const handleRoleSwitch = async (role: UserRole) => {
    // Map role to seeded demo username
    const roleUserMap: Record<UserRole, string> = {
      FINANCE_ADMIN: 'finance_admin',
      SYSTEM_ADMIN: 'admin',
      BRANCH_MANAGER: 'manager_borella',
      CASHIER: 'cashier_borella',
      DISPATCHER: 'custodian_ho',
      RECEIVING_OFFICER: 'receiver_borella',
      AUDITOR: 'auditor_read',
    };

    const targetUser = roleUserMap[role] || 'finance_admin';
    await performLogin(targetUser, 'Admin@123');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  // If unauthenticated and not loading
  if (!currentUser && !loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2rem', background: '#111827' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}>
              <Lock size={24} color="#fff" />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>Cash Management System</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sign in to access authorized financial operations</p>
          </div>

          {loginError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem',
              marginBottom: '1rem',
              color: '#ef4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); performLogin(loginIdentifier, loginPassword); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Username or Email</label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <button type="submit" disabled={loginLoading} className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              <LogIn size={18} />
              <span>{loginLoading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main style={{
        flex: 1,
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}>
        {currentTab === 'dashboard' && (
          <DashboardView
            branches={branches}
            accounts={accounts}
            transfers={transfers}
            currentUser={currentUser}
            onOpenNewTransfer={() => setIsNewTransferModalOpen(true)}
            onRefresh={loadMasterData}
          />
        )}

        {currentTab === 'transfers' && (
          <TransfersView
            transfers={transfers}
            currentUser={currentUser}
            onOpenNewTransfer={() => setIsNewTransferModalOpen(true)}
            onRefresh={loadMasterData}
          />
        )}

        {currentTab === 'tills' && (
          <TillsView
            currentUser={currentUser}
            accounts={accounts}
          />
        )}

        {currentTab === 'ledger' && (
          <LedgerView
            currentUser={currentUser}
          />
        )}

        {currentTab === 'audit' && (
          <AuditView
            currentUser={currentUser}
          />
        )}
      </main>

      {/* New Transfer Modal */}
      <NewTransferModal
        isOpen={isNewTransferModalOpen}
        onClose={() => setIsNewTransferModalOpen(false)}
        accounts={accounts}
        currentUser={currentUser}
        onSuccess={loadMasterData}
      />
    </div>
  );
}
