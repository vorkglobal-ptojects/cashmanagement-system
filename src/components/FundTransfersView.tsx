'use client';

import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  DollarSign, 
  Plus, 
  Building2, 
  User, 
  FileText,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { AuthSession, FundTransferRequest } from '@/lib/types';

interface FundTransfersViewProps {
  transfers: FundTransferRequest[];
  branches: any[];
  currentUser: AuthSession | null;
  onOpenNewTransfer: () => void;
  onSelectTransfer: (transfer: FundTransferRequest) => void;
  onRefresh: () => void;
}

export default function FundTransfersView({
  transfers,
  branches,
  currentUser,
  onOpenNewTransfer,
  onSelectTransfer,
  onRefresh,
}: FundTransfersViewProps) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const statusTabs = [
    { id: 'ALL', label: 'All Transfers', count: transfers.length },
    { id: 'PENDING_APPROVAL', label: 'Pending Approval', count: transfers.filter((t) => t.status === 'PENDING_APPROVAL').length, color: '#fbbf24' },
    { id: 'APPROVED_AWAITING_PAYMENT', label: 'Approved (Awaiting Payment)', count: transfers.filter((t) => t.status === 'APPROVED_AWAITING_PAYMENT').length, color: '#22d3ee' },
    { id: 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION', label: 'Awaiting Verification', count: transfers.filter((t) => t.status === 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION').length, color: '#c084fc' },
    { id: 'VERIFICATION_REQUIRED', label: 'Flagged for Review', count: transfers.filter((t) => t.status === 'VERIFICATION_REQUIRED').length, color: '#fb923c' },
    { id: 'COMPLETED', label: 'Completed', count: transfers.filter((t) => t.status === 'COMPLETED').length, color: '#34d399' },
    { id: 'REJECTED', label: 'Rejected', count: transfers.filter((t) => t.status === 'REJECTED').length, color: '#f87171' },
  ];

  // Filtering
  const filtered = transfers.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesBranch =
      branchFilter === 'All' ||
      t.requestingBranchId === branchFilter ||
      t.fundingBranchId === branchFilter;
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer?.nicNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.bankTransactionReference && t.bankTransactionReference.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesBranch && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <span className="badge badge-pending"><Clock size={12} /> Pending Approval</span>;
      case 'APPROVED_AWAITING_PAYMENT':
        return <span className="badge badge-approved"><CheckCircle size={12} /> Approved — Awaiting Payment</span>;
      case 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION':
        return <span className="badge badge-awaiting-verify"><Clock size={12} /> Awaiting Verification</span>;
      case 'VERIFICATION_REQUIRED':
        return <span className="badge badge-flagged"><AlertTriangle size={12} /> Verification Flagged</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed"><ShieldCheck size={12} /> Completed</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Interbranch Fund Transfers
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
            Dynamic multi-branch liquidity routing, two-tier approval workflow, and direct-to-customer bank execution
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewTransfer}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>New Transfer Request</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
      }}>
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: isActive ? '#34d399' : '#94a3b8',
                borderBottom: isActive ? '2px solid #10b981' : '2px solid transparent',
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                color: isActive ? '#070d18' : '#cbd5e1',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Request ID, Customer name, NIC, bank ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.55rem 0.85rem 0.55rem 2.25rem',
              color: '#fff',
              fontSize: '0.85rem',
            }}
          />
        </div>

        {/* Dynamic Branch Dropdown (Matching institution's 11 branches) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="#94a3b8" />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Branch:</span>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            style={{
              background: '#0c1427',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              color: '#34d399',
              fontWeight: 700,
              fontSize: '0.825rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Transfers Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Transfer ID</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Customer &amp; Bank</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Routing (From &rarr; To)</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Requested</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Paid Amount</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No fund transfers match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTransfer(t)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 800, color: '#fff' }}>{t.id}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {new Date(t.requestDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>
                        {t.customer?.fullName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                        {t.customer?.bankName} ({t.customer?.bankBranch})
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
                        <span>{t.requestingBranch?.name}</span>
                        <span style={{ color: '#06b6d4' }}>&rarr;</span>
                        <span style={{ fontWeight: 700, color: '#22d3ee' }}>{t.fundingBranch?.name}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        By: {t.requestingUserName}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                        LKR {t.requestedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      {t.actualAmountPaid ? (
                        <div>
                          <div style={{ fontWeight: 700, color: '#34d399' }}>
                            LKR {t.actualAmountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#c084fc' }}>
                            {t.paymentMethod} • {t.bankTransactionReference}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Pending</span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      {getStatusBadge(t.status)}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransfer(t);
                        }}
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#34d399',
                          borderRadius: '6px',
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Eye size={13} /> Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
