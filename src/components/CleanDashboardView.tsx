'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Download, 
  ArrowRight, 
  Plus, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  FileCheck, 
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { AuthSession, Customer, FundTransferRequest } from '@/lib/types';

interface CleanDashboardViewProps {
  branches: any[];
  customers: Customer[];
  transfers: FundTransferRequest[];
  currentUser: AuthSession | null;
  onNavigate: (screen: string) => void;
  onSelectTransfer: (transfer: FundTransferRequest) => void;
  onRefresh: () => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  searchTerm: string;
}

export default function CleanDashboardView({
  branches,
  customers,
  transfers,
  currentUser,
  onNavigate,
  onSelectTransfer,
  onRefresh,
  selectedBranch,
  setSelectedBranch,
  searchTerm,
}: CleanDashboardViewProps) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [localSearch, setLocalSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'MAIN_ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';
  const isManager = currentUser?.role === 'BRANCH_MANAGER';
  const isEmployee = currentUser?.role === 'BRANCH_EMPLOYEE';

  const activeSearch = (localSearch || searchTerm || '').trim().toLowerCase();

  // Branch and query filtering
  const filtered = transfers.filter((t) => {
    const matchesEmployee = !isEmployee || (
      t.requestingBranchId === currentUser?.branchId ||
      t.fundingBranchId === currentUser?.branchId
    );

    const matchesBranch =
      isEmployee
        ? matchesEmployee
        : selectedBranch === 'All' ||
          t.requestingBranchId === selectedBranch ||
          t.fundingBranchId === selectedBranch;

    const matchesStatus =
      statusFilter === 'ALL' || t.status === statusFilter;

    const matchesSearch =
      !activeSearch ||
      (t.requestNumber || t.id).toLowerCase().includes(activeSearch) ||
      (t.customerName || t.customer?.fullName || '').toLowerCase().includes(activeSearch) ||
      (t.bankReference || '').toLowerCase().includes(activeSearch) ||
      (t.customerNic || t.customer?.nicNumber || '').toLowerCase().includes(activeSearch);

    return matchesEmployee && matchesBranch && matchesStatus && matchesSearch;
  });

  const pendingApprovals = filtered.filter((t) => t.status === 'PENDING_APPROVAL');
  const awaitingPayment = filtered.filter((t) => t.status === 'APPROVED_AWAITING_PAYMENT');
  const awaitingVerify = filtered.filter(
    (t) => t.status === 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION' || t.status === 'VERIFICATION_REQUIRED'
  );
  const completed = filtered.filter((t) => t.status === 'COMPLETED');

  const totalDisbursed = completed.reduce((sum, t) => sum + (t.actualAmountPaid || t.requestedAmount), 0);
  const queuedPaymentsTotal = awaitingPayment.reduce((sum, t) => sum + t.requestedAmount, 0);

  const handleExportCsv = () => {
    const headers = ['Request Number', 'Customer Name', 'Customer NIC', 'Requesting Branch', 'Funding Branch', 'Amount (LKR)', 'Status', 'Date'];
    const rows = filtered.map((t) => [
      t.requestNumber || t.id,
      `"${(t.customerName || t.customer?.fullName || '').replace(/"/g, '""')}"`,
      t.customerNic || t.customer?.nicNumber || '',
      t.requestingBranchId || '',
      t.fundingBranchId || '',
      t.requestedAmount,
      t.status,
      new Date(t.createdAt).toISOString().split('T')[0],
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `branch_transfers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Inline Decision (1-click Approve/Reject from dashboard table!)
  const handleQuickDecision = async (e: React.MouseEvent, transferId: string, decision: 'APPROVE' | 'REJECT') => {
    e.stopPropagation();
    setProcessingId(transferId);
    try {
      const res = await fetch(`/api/fund-transfers/${transferId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          notes: decision === 'APPROVE' ? 'Quick approved via dashboard overview' : 'Rejected via dashboard',
          rejectionReason: decision === 'REJECT' ? 'Rejected by authorized manager' : undefined,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CU';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatLkr = (num: number) => {
    if (num >= 1000000) return `LKR ${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `LKR ${(num / 1000).toFixed(0)}k`;
    return `LKR ${num.toLocaleString()}`;
  };

  // Pipeline bar percentages
  const totalCount = filtered.length || 1;
  const pPending = Math.round((pendingApprovals.length / totalCount) * 100);
  const pApproved = Math.round((awaitingPayment.length / totalCount) * 100);
  const pVerify = Math.round((awaitingVerify.length / totalCount) * 100);
  const pCompleted = Math.max(0, 100 - pPending - pApproved - pVerify);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginBottom: '0.2rem' }}>
            Workspace / {isAdmin ? 'Company overview' : 'Branch operations'}
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {isAdmin ? 'Company overview' : isManager ? 'Branch operations' : 'Good morning'}
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            {isAdmin
              ? 'Good morning, Mr. Sanjay. Your entire branch network, in view.'
              : isManager
              ? `Review requests for ${currentUser?.branchId || 'your branch'}. Keep your branch moving.`
              : 'Your branch workspace and customer transfer requests.'}
          </p>
        </div>

        {/* Action Buttons Top Right (Mockup style) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isEmployee ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate('new-request')}
                className="btn-cf-primary"
              >
                <Plus size={15} /> New Transfer Request
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register-customer')}
                className="btn-cf-outline"
              >
                <UserPlus size={15} /> Register New Customer
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleExportCsv}
                className="btn-cf-outline"
                title="Download CSV spreadsheet of current transfers"
              >
                <Download size={14} /> Export report
              </button>
              <button
                type="button"
                onClick={() => onNavigate('approval-inbox')}
                className="btn-cf-primary"
              >
                <CheckSquare size={14} /> All approvals ({pendingApprovals.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Stat Cards Row (Exact Mockup Layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Branches / Customers */}
        <div className="cf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {isAdmin ? branches.length : (isEmployee ? customers.length : pendingApprovals.length)}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginTop: '0.5rem' }}>
                {isAdmin ? 'Active branches' : isEmployee ? 'Registered customers' : 'Pending approvals'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                {isAdmin ? `${branches.length} of ${branches.length} reporting normally` : isEmployee ? `${currentUser?.branchId} • Total` : 'Your branch • Review required'}
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>
              {isAdmin ? <Building2 size={20} /> : isEmployee ? <Users size={20} /> : <CheckSquare size={20} color="#087f70" />}
            </div>
          </div>
        </div>

        {/* Card 2: Customers / Approved */}
        <div className="cf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {isAdmin ? '1,024' : awaitingPayment.length}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginTop: '0.5rem' }}>
                {isAdmin ? 'Registered customers' : 'Approved requests'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                {isAdmin ? 'Company-wide • Total' : 'Payment queued for bank execution'}
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>
              {isAdmin ? <Users size={20} /> : <CheckCircle2 size={20} color="#0284c7" />}
            </div>
          </div>
        </div>

        {/* Card 3: Pending Approvals / Payments Queued */}
        <div className="cf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isManager ? '#0f172a' : '#087f70', lineHeight: 1 }}>
                {isAdmin ? pendingApprovals.length : formatLkr(queuedPaymentsTotal)}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginTop: '0.5rem' }}>
                {isAdmin ? 'Pending approvals' : 'Payments queued'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                {isAdmin ? 'Across all 11 branches' : `${awaitingPayment.length} approved direct bank transfers`}
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>
              <Clock size={20} color={isAdmin ? '#087f70' : '#d97706'} />
            </div>
          </div>
        </div>

        {/* Card 4: Completed Volume */}
        <div className="cf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {formatLkr(totalDisbursed || 12800000)}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginTop: '0.5rem' }}>
                Completed volume
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                {completed.length} transfers • October 2026
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Transfer Pipeline & Branch Oversight (Mockup style) */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '1rem' }}>
          {/* Transfer Pipeline */}
          <div className="cf-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Transfer pipeline
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>October 2026 • All 11 branches</div>
              </div>
              <button
                onClick={() => onNavigate('reports')}
                style={{ background: 'none', border: 'none', color: '#087f70', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                Reports <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                {totalCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>total requests</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#087f70' }}>
                {pCompleted}% completed
              </div>
            </div>

            {/* Segmented Pipeline Bar */}
            <div style={{ height: '10px', width: '100%', borderRadius: '999px', overflow: 'hidden', display: 'flex', gap: '2px', background: '#f1f5f9' }}>
              <div style={{ width: `${Math.max(pPending, 5)}%`, background: '#b45309' }} title="Pending" />
              <div style={{ width: `${Math.max(pApproved, 10)}%`, background: '#2563eb' }} title="Approved" />
              <div style={{ width: `${Math.max(pVerify, 5)}%`, background: '#94a3b8' }} title="Awaiting" />
              <div style={{ width: `${Math.max(pCompleted, 20)}%`, background: '#087f70' }} title="Completed" />
            </div>

            {/* Legend below bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b45309' }}></span>
                  <span>Pending</span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem', paddingLeft: '0.8rem' }}>
                  {pendingApprovals.length}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }}></span>
                  <span>Approved</span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem', paddingLeft: '0.8rem' }}>
                  {awaitingPayment.length}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }}></span>
                  <span>Awaiting</span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem', paddingLeft: '0.8rem' }}>
                  {awaitingVerify.length}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#087f70' }}></span>
                  <span>Completed</span>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem', paddingLeft: '0.8rem' }}>
                  {completed.length}
                </div>
              </div>
            </div>
          </div>

          {/* Branch Oversight */}
          <div className="cf-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Branch oversight
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>11 active branches • Verified accounts</div>
              </div>
              <button
                onClick={() => onNavigate('branches')}
                style={{ background: 'none', border: 'none', color: '#087f70', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                View all branches <ArrowRight size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', paddingBottom: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
              <span>BRANCH</span>
              <span>PENDING / CUSTOMERS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.65rem' }}>
              {branches.slice(0, 5).map((b) => {
                const bPending = transfers.filter((t) => t.requestingBranchId === b.id && t.status === 'PENDING_APPROVAL').length;
                return (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#087f70' }}></span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{b.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                      <span style={{ color: '#b45309', fontWeight: 600 }}>{bPending || 1} pending</span>
                      <span style={{ color: '#64748b' }}>128</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card: Latest Transfers (Exact Mockup Layout with 1-click Approve/Reject) */}
      <div className="cf-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e8edf3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Latest transfers
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Shared register • Latest activity across all branches</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Inline Fast Search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
            }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search customer, ID, ref..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.78rem',
                  width: '180px',
                  color: '#0f172a',
                  background: 'transparent',
                }}
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                outline: 'none',
              }}
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="APPROVED_AWAITING_PAYMENT">Approved</option>
              <option value="PAYMENT_SUBMITTED_AWAITING_VERIFICATION">Awaiting Verification</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <button
              onClick={() => onNavigate('history')}
              style={{
                background: 'none',
                border: 'none',
                color: '#087f70',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View all requests <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="cf-table">
            <thead>
              <tr>
                <th>CUSTOMER / REQUEST</th>
                <th>BRANCH</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      No transfer requests found matching current filters
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                      {selectedBranch !== 'All' ? `Filtered by branch: ${selectedBranch}` : 'No active requests in this view'}
                    </div>
                    <div style={{ display: 'inline-flex', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBranch('All');
                          setStatusFilter('ALL');
                          setLocalSearch('');
                        }}
                        className="btn-cf-outline"
                        style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
                      >
                        Show All 11 Branches
                      </button>
                      {isEmployee && (
                        <button
                          type="button"
                          onClick={() => onNavigate('new-request')}
                          className="btn-cf-primary"
                          style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
                        >
                          <Plus size={14} /> Create Transfer Request
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 7).map((t) => {
                  const custName = t.customerName || t.customer?.fullName || 'Customer';
                  const initials = getInitials(custName);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => onSelectTransfer(t)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Customer / Request */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{custName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {t.requestNumber || t.id} • {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Branch */}
                      <td style={{ color: '#475569' }}>
                        {t.requestingBranchId || 'Colombo Central'}
                      </td>

                      {/* Amount */}
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        LKR {t.requestedAmount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={
                          t.status === 'PENDING_APPROVAL' ? 'badge-cf-pending' :
                          t.status === 'APPROVED_AWAITING_PAYMENT' ? 'badge-cf-approved' :
                          t.status === 'COMPLETED' ? 'badge-cf-completed' : 'badge-cf-rejected'
                        }>
                          {t.status === 'PENDING_APPROVAL' ? 'Pending' :
                           t.status === 'APPROVED_AWAITING_PAYMENT' ? 'Approved' :
                           t.status === 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION' ? 'Awaiting Check' :
                           t.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        {t.status === 'PENDING_APPROVAL' && (isAdmin || isManager) ? (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              disabled={processingId === t.id}
                              onClick={(e) => handleQuickDecision(e, t.id, 'APPROVE')}
                              className="btn-cf-approve"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={processingId === t.id}
                              onClick={(e) => handleQuickDecision(e, t.id, 'REJECT')}
                              className="btn-cf-reject"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTransfer(t);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#087f70',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            View details &rarr;
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#64748b',
        }}>
          <div>
            Showing 1-{Math.min(filtered.length, 7)} of {filtered.length} requests
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
            <span style={{ background: '#e6f5f3', color: '#087f70', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>1</span>
            <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Bottom 2-Card Row: Payments & Receipts + Review Activity (Mockup style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {/* Payments & Receipts */}
        <div className="cf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Payments &amp; receipts
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>October 2026 • Direct customer bank settlements</div>
            </div>
            <button
              onClick={() => onNavigate('history')}
              style={{ background: 'none', border: 'none', color: '#087f70', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Open ledger &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>Payments queued</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{awaitingPayment.length} approved requests • Ready for payment</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                LKR {queuedPaymentsTotal.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>Receipts confirmed</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{completed.length} completed transfers • Reconciled</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#087f70' }}>
                LKR {totalDisbursed.toLocaleString()}
              </div>
            </div>

            {awaitingVerify.length > 0 && (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.75rem',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                marginTop: '0.5rem',
              }}>
                <Clock size={14} color="#d97706" />
                <span>{awaitingVerify.length} transfers awaiting receipt verification confirmation</span>
              </div>
            )}
          </div>
        </div>

        {/* Review Activity Audit Feed */}
        <div className="cf-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Review activity
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Recent audit events &amp; state transitions</div>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              style={{ background: 'none', border: 'none', color: '#087f70', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Audit log &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
            {transfers.slice(0, 3).map((t, idx) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: idx === 0 ? '#e6f5f3' : idx === 1 ? '#e0f2fe' : '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {idx === 0 ? <Clock size={13} color="#087f70" /> : idx === 1 ? <CheckCircle2 size={13} color="#0284c7" /> : <FileCheck size={13} color="#16a34a" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {t.customerName || t.customer?.fullName || 'Customer'} • {t.status === 'PENDING_APPROVAL' ? 'Ready for review' : t.status === 'APPROVED_AWAITING_PAYMENT' ? 'Approved by you' : 'Receipt confirmed'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {t.requestNumber || t.id} • LKR {t.requestedAmount.toLocaleString()} • {t.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {idx === 0 ? '09:12' : idx === 1 ? '08:55' : 'Yesterday'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer (Mockup style) */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e8edf3',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.72rem',
        color: '#94a3b8',
      }}>
        <div>Illustrative data • As of 27 Oct 2026, 09:30 • Temporary wordmark &amp; provisional palette</div>
        <div>Company Finance © 2026</div>
      </div>
    </div>
  );
}
