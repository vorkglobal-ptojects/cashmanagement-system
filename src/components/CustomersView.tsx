'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Building2, 
  Phone, 
  CreditCard, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Filter 
} from 'lucide-react';
import { AuthSession, Customer } from '@/lib/types';

interface CustomersViewProps {
  customers: Customer[];
  branches: any[];
  currentUser: AuthSession | null;
  onOpenRegisterModal: () => void;
  onSelectCustomer: (customerId: string) => void;
  onRefresh: () => void;
}

export default function CustomersView({
  customers,
  branches,
  currentUser,
  onOpenRegisterModal,
  onSelectCustomer,
  onRefresh,
}: CustomersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [unmaskAll, setUnmaskAll] = useState(false);

  const canUnmask =
    currentUser?.role === 'MAIN_ADMIN' ||
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'BRANCH_MANAGER';

  // Filter customers
  const filtered = customers.filter((c) => {
    const matchesBranch = selectedBranch === 'All' || c.registeringBranchId === selectedBranch;
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nicNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm) ||
      c.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch;
  });

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
          <Users size={18} color="#0d9488" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Customer Directory &amp; Bank Accounts
          </h2>
          <span style={{
            fontSize: '0.75rem',
            background: '#f1f5f9',
            color: '#475569',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            fontWeight: 600,
          }}>
            {filtered.length} Customers
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {canUnmask && (
            <button
              type="button"
              onClick={() => setUnmaskAll(!unmaskAll)}
              className="btn-secondary"
              style={{ fontSize: '0.78rem' }}
            >
              {unmaskAll ? <EyeOff size={14} color="#0d9488" /> : <Eye size={14} />}
              <span>{unmaskAll ? 'Mask Bank Details' : 'Unmask (Authorized)'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="btn-primary"
            style={{ fontSize: '0.78rem' }}
          >
            <UserPlus size={14} /> Register Customer
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="d365-card" style={{
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '240px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.35rem 0.65rem' }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search by customer name, NIC, phone, bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.82rem',
              width: '100%',
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.78rem', color: '#64748b' }}>Branch:</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="field-input"
            style={{ width: 'auto', padding: '0.35rem 0.65rem' }}
          >
            <option value="All">All 11 Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="d365-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="d365-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>NIC Number</th>
                <th>Bank Name</th>
                <th>Account Number</th>
                <th>Account Holder</th>
                <th>Phone</th>
                <th>Registered At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No registered customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const displayAccount = unmaskAll && c.rawBankAccount ? c.rawBankAccount : c.bankAccountNumber;
                  const displayNic = unmaskAll && c.rawNic ? c.rawNic : c.nicNumber;

                  return (
                    <tr key={c.id}>
                      <td>
                        <button
                          onClick={() => onSelectCustomer(c.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284c7',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '0.84rem',
                          }}
                        >
                          {c.id}
                        </button>
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.fullName}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                          {displayNic}
                        </span>
                      </td>
                      <td>
                        <div>{c.bankName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.bankBranch || 'Main'}</div>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          color: '#0d9488',
                          background: '#f0fdfa',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                        }}>
                          {displayAccount}
                        </span>
                      </td>
                      <td>{c.accountHolderName}</td>
                      <td style={{ fontSize: '0.78rem', color: '#475569' }}>{c.phoneNumber}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                          {c.registeringBranchId}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => onSelectCustomer(c.id)}
                          className="btn-secondary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
