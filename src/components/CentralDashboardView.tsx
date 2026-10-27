'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRightLeft, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  Plus, 
  UserPlus, 
  ShieldCheck, 
  FileText, 
  Eye, 
  ArrowUpRight,
  TrendingUp,
  Filter
} from 'lucide-react';
import { AuthSession, Customer, FundTransferRequest } from '@/lib/types';

interface CentralDashboardViewProps {
  branches: any[];
  customers: Customer[];
  transfers: FundTransferRequest[];
  currentUser: AuthSession | null;
  onOpenNewTransfer: () => void;
  onOpenRegisterCustomer: () => void;
  onSelectTransfer: (transfer: FundTransferRequest) => void;
  onViewTransfersTab: () => void;
}

export default function CentralDashboardView({
  branches,
  customers,
  transfers,
  currentUser,
  onOpenNewTransfer,
  onOpenRegisterCustomer,
  onSelectTransfer,
  onViewTransfersTab,
}: CentralDashboardViewProps) {
  const [selectedBranch, setSelectedBranch] = useState('All');

  // Filter transfers based on selected branch
  const branchFilteredTransfers = transfers.filter((t) => {
    if (selectedBranch === 'All') return true;
    return t.requestingBranchId === selectedBranch || t.fundingBranchId === selectedBranch;
  });

  // KPI Calculations
  const pendingApprovals = branchFilteredTransfers.filter((t) => t.status === 'PENDING_APPROVAL');
  const awaitingPayment = branchFilteredTransfers.filter((t) => t.status === 'APPROVED_AWAITING_PAYMENT');
  const awaitingVerify = branchFilteredTransfers.filter((t) => t.status === 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION');
  const flaggedTransfers = branchFilteredTransfers.filter((t) => t.status === 'VERIFICATION_REQUIRED');
  const completedTransfers = branchFilteredTransfers.filter((t) => t.status === 'COMPLETED');

  const totalRequestedVolume = branchFilteredTransfers.reduce((acc, t) => acc + t.requestedAmount, 0);
  const totalDisbursedVolume = completedTransfers.reduce((acc, t) => acc + (t.actualAmountPaid || t.requestedAmount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Executive Welcome & Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(3, 105, 161, 0.12) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img src="/logo.png" alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                {currentUser?.role === 'MAIN_ADMIN' ? 'Mr. Sanjay • Central Treasury Dashboard' : `${currentUser?.firstName}'s Branch Dashboard`}
              </h2>
              <span className="badge badge-completed">
                {currentUser?.role}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.15rem 0 0 0' }}>
              Consolidated Multi-Branch Fund Transfer &amp; Direct Customer Banking Monitor
            </p>
          </div>
        </div>

        {/* Dynamic Branch Dropdown (Matching institution's 11 branches) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(7, 13, 24, 0.65)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '10px',
            padding: '0.45rem 0.85rem',
          }}>
            <Filter size={15} color="#34d399" />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Viewing Branch:
            </span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#34d399',
                fontWeight: 800,
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="All" style={{ background: '#0c1427', color: '#fff' }}>
                All 11 Branches
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} style={{ background: '#0c1427', color: '#fff' }}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenNewTransfer}
            className="btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>New Transfer Request</span>
          </button>

          <button
            type="button"
            onClick={onOpenRegisterCustomer}
            className="btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <UserPlus size={16} />
            <span>Register Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Total Disbursed */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Disbursed (Completed)
            </span>
            <DollarSign size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', margin: '0.4rem 0 0.2rem 0' }}>
            LKR {totalDisbursedVolume.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {completedTransfers.length} verified direct bank transfers
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>
              Pending Approval
            </span>
            <Clock size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', margin: '0.4rem 0 0.2rem 0' }}>
            {pendingApprovals.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Awaiting Manager or Mr. Sanjay authorization
          </div>
        </div>

        {/* Approved — Awaiting Payment */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#22d3ee', textTransform: 'uppercase', fontWeight: 700 }}>
              Approved (Awaiting Payment)
            </span>
            <CheckCircle size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22d3ee', margin: '0.4rem 0 0.2rem 0' }}>
            {awaitingPayment.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Ready for customer bank execution &amp; receipt upload
          </div>
        </div>

        {/* Awaiting Verification */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700 }}>
              Awaiting Verification
            </span>
            <FileText size={18} color="#c084fc" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc', margin: '0.4rem 0 0.2rem 0' }}>
            {awaitingVerify.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Receipts uploaded awaiting confirmation
          </div>
        </div>

        {/* Flagged for Review */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#fb923c', textTransform: 'uppercase', fontWeight: 700 }}>
              Flagged for Review
            </span>
            <AlertTriangle size={18} color="#fb923c" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb923c', margin: '0.4rem 0 0.2rem 0' }}>
            {flaggedTransfers.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Discrepancy or unclear receipt flagged
          </div>
        </div>
      </div>

      {/* Urgent Workflow Queue Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* 1. Requests Awaiting Approval */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#fbbf24" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Requests Awaiting Authorization ({pendingApprovals.length})
              </h3>
            </div>
            <button
              onClick={onViewTransfersTab}
              style={{ background: 'transparent', border: 'none', color: '#34d399', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              View All &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingApprovals.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                All funding requests authorized! No pending approvals.
              </p>
            ) : (
              pendingApprovals.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTransfer(t)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                      {t.id} • {t.customer?.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      {t.requestingBranch?.name} &rarr; <span style={{ color: '#22d3ee' }}>{t.fundingBranch?.name}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                      LKR {t.requestedAmount.toLocaleString()}
                    </div>
                    <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>
                      Authorize &rarr;
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Approved Requests Awaiting Bank Payment & Receipt Upload */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Approved — Ready for Bank Payment ({awaitingPayment.length})
              </h3>
            </div>
            <button
              onClick={onViewTransfersTab}
              style={{ background: 'transparent', border: 'none', color: '#34d399', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              View All &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {awaitingPayment.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No transfers currently awaiting bank payment.
              </p>
            ) : (
              awaitingPayment.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTransfer(t)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                      {t.id} • {t.customer?.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                      Bank: {t.customer?.bankName} (A/C: {t.customer?.bankAccountNumber})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                      LKR {t.requestedAmount.toLocaleString()}
                    </div>
                    <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>
                      Pay &amp; Upload Slip &rarr;
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. High-Priority Verification & Missing Receipt Alert Banner */}
      {(awaitingVerify.length > 0 || flaggedTransfers.length > 0) && (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(249, 115, 22, 0.12) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={22} color="#c084fc" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {awaitingVerify.length} Payment Receipts Awaiting Verification • {flaggedTransfers.length} Flagged For Review
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0.15rem 0 0 0' }}>
                Independent verifier check is required before marking these bank transactions as officially Completed.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewTransfersTab}
            style={{
              background: 'rgba(139, 92, 246, 0.25)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              color: '#c084fc',
              borderRadius: '8px',
              padding: '0.55rem 1rem',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Review Receipts Queue &rarr;
          </button>
        </div>
      )}

      {/* Branch Liquidity & Routing Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} color="#34d399" />
          Configured Branch Operations ({branches.length} Locations)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>Branch</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>Code</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>City</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Cash Holding Limit</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Role</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#fff' }}>
                    {b.name}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#22d3ee', fontWeight: 600 }}>
                    {b.code}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                    {b.city}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>
                    LKR {b.cashLimit?.toLocaleString() || '10,000,000'}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#94a3b8' }}>
                    Bidirectional Liquidity Node
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                    <span className="badge badge-completed" style={{ fontSize: '0.65rem' }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
