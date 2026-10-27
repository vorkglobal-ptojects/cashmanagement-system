'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Users, Plus, Shield, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthSession } from '@/lib/types';

interface BranchUserManagementViewProps {
  branches: any[];
  currentUser: AuthSession | null;
  onRefresh: () => void;
}

export default function BranchUserManagementView({
  branches,
  currentUser,
  onRefresh,
}: BranchUserManagementViewProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'branches' | 'users'>('branches');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('Admin@123');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRole, setNewRole] = useState<'BRANCH_EMPLOYEE' | 'BRANCH_MANAGER' | 'MAIN_ADMIN'>('BRANCH_EMPLOYEE');
  const [newBranchId, setNewBranchId] = useState('BRL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          firstName: newFirstName,
          lastName: newLastName,
          role: newRole,
          branchId: newRole === 'MAIN_ADMIN' ? 'SUPER' : newBranchId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setSuccessMsg(`User ${newUsername} provisioned successfully!`);
      setNewUsername('');
      setNewFirstName('');
      setNewLastName('');
      setIsAddUserOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Dynamics 365 Command Bar */}
      <div className="d365-card" style={{
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Building2 size={18} color="#0d9488" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Enterprise Branch &amp; User Administration
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('branches')}
            className={activeTab === 'branches' ? 'btn-primary' : 'btn-secondary'}
          >
            <Building2 size={14} /> 11 Branches ({branches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
          >
            <Users size={14} /> Staff &amp; Roles ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="btn-primary"
          >
            <UserPlus size={14} /> Provision User
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '4px',
          padding: '0.75rem 1rem',
          color: '#991b1b',
          fontSize: '0.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: '4px',
          padding: '0.75rem 1rem',
          color: '#166534',
          fontSize: '0.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="d365-card" style={{ padding: '1.25rem', borderLeft: '4px solid #0d9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Provision New Institutional User
            </h3>
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            >
              Close
            </button>
          </div>

          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="field-label">Username *</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="field-input"
                placeholder="e.g. employee_w3"
                required
              />
            </div>

            <div>
              <label className="field-label">Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="field-input"
                required
              />
            </div>

            <div>
              <label className="field-label">First Name *</label>
              <input
                type="text"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                className="field-input"
                placeholder="e.g. Nimal"
                required
              />
            </div>

            <div>
              <label className="field-label">Last Name</label>
              <input
                type="text"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                className="field-input"
                placeholder="e.g. Silva"
              />
            </div>

            <div>
              <label className="field-label">System Role *</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="field-input"
              >
                <option value="BRANCH_EMPLOYEE">Branch Employee (Register &amp; Request)</option>
                <option value="BRANCH_MANAGER">Branch Manager (Approve, Pay &amp; Verify)</option>
                <option value="MAIN_ADMIN">Main Administrator (Mr. Sanjay)</option>
              </select>
            </div>

            {newRole !== 'MAIN_ADMIN' && (
              <div>
                <label className="field-label">Assigned Branch *</label>
                <select
                  value={newBranchId}
                  onChange={(e) => setNewBranchId(e.target.value)}
                  className="field-input"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Provisioning...' : 'Create User Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Branches Table */}
      {activeTab === 'branches' && (
        <div className="d365-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="d365-table">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Branch Code</th>
                  <th>City / Location</th>
                  <th>Cash Holding Limit</th>
                  <th>Role Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ID: {b.id}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0d9488' }}>{b.code}</span>
                    </td>
                    <td>{b.city || 'Colombo Area'}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      LKR {b.cashHoldingLimit ? Number(b.cashHoldingLimit).toLocaleString() : '5,000,000'}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                        {b.id === 'SUPER' ? 'Institution Central Control' : 'Authorized Funding / Requesting Branch'}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge status-completed">
                        Active &amp; Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="d365-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="d365-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Assigned Branch</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {u.firstName} {u.lastName}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#0284c7' }}>{u.username}</td>
                    <td>
                      <span className={`status-badge ${u.role === 'MAIN_ADMIN' ? 'status-completed' : u.role === 'BRANCH_MANAGER' ? 'status-approved-awaiting-payment' : 'status-pending-approval'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{u.branchId || 'All Branches'}</span>
                    </td>
                    <td>
                      <span className="status-badge status-completed">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
