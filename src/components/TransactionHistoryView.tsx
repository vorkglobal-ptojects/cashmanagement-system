'use client';

import React, { useState } from 'react';
import { History, Search, Filter, Download, ArrowRightLeft, FileText, CheckCircle2 } from 'lucide-react';
import { AuthSession, FundTransferRequest } from '@/lib/types';

interface TransactionHistoryViewProps {
  transfers: FundTransferRequest[];
  branches: any[];
  currentUser: AuthSession | null;
  onSelectTransfer: (transfer: FundTransferRequest) => void;
}

export default function TransactionHistoryView({
  transfers,
  branches,
  currentUser,
  onSelectTransfer,
}: TransactionHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filtered = transfers.filter((t) => {
    const matchesBranch =
      selectedBranch === 'All' ||
      t.requestingBranchId === selectedBranch ||
      t.fundingBranchId === selectedBranch;

    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;

    const reqNum = (t.requestNumber || t.id || '').toLowerCase();
    const custName = (t.customerName || t.customer?.fullName || '').toLowerCase();
    const custNic = (t.customerNic || t.customer?.nicNumber || '').toLowerCase();
    const bankRef = (t.bankReference || t.bankTransactionReference || '').toLowerCase();
    const reasonText = (t.reason || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      reqNum.includes(term) ||
      custName.includes(term) ||
      custNic.includes(term) ||
      bankRef.includes(term) ||
      reasonText.includes(term);

    return matchesBranch && matchesStatus && matchesSearch;
  });

  const exportCsv = () => {
    const headers = [
      'Request Number',
      'Customer',
      'NIC',
      'Bank',
      'Requesting Branch',
      'Funding Branch',
      'Amount',
      'Status',
      'Payment Rail',
      'Bank Reference',
      'Created At',
    ];
    const rows = filtered.map((t) => [
      t.requestNumber || t.id,
      `"${t.customerName || t.customer?.fullName || ''}"`,
      t.customerNic || t.customer?.nicNumber || '',
      `"${t.bankName || t.customer?.bankName || ''}"`,
      t.requestingBranchId,
      t.fundingBranchId,
      t.requestedAmount,
      t.status,
      t.paymentMethod || '',
      t.bankReference || t.bankTransactionReference || '',
      new Date(t.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fund_transfers_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <History size={18} color="#0d9488" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Complete Interbranch Transfer &amp; Payment Ledger
          </h2>
          <span style={{
            fontSize: '0.75rem',
            background: '#f1f5f9',
            color: '#475569',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            fontWeight: 600,
          }}>
            {filtered.length} Records
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={exportCsv}
            className="btn-secondary"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="d365-card" style={{
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: '220px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.35rem 0.65rem' }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search request #, customer, NIC, reference..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.78rem', color: '#64748b' }}>Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="field-input"
            style={{ width: 'auto', padding: '0.35rem 0.65rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED_AWAITING_PAYMENT">Approved (Awaiting Payment)</option>
            <option value="PAYMENT_SUBMITTED_AWAITING_VERIFICATION">Awaiting Verification</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="VERIFICATION_REQUIRED">Flagged Review</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="d365-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="d365-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Date</th>
                <th>Customer / Beneficiary</th>
                <th>Bank &amp; Account</th>
                <th>Requesting &rarr; Funding</th>
                <th>Amount (LKR)</th>
                <th>Status</th>
                <th>Payment Ref</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No fund transfer transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <button
                        onClick={() => onSelectTransfer(t)}
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
                        {t.requestNumber || t.id}
                      </button>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.customerName || t.customer?.fullName || 'Valued Customer'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>NIC: {t.customerNic || t.customer?.nicNumber || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.bankName || t.customer?.bankName || 'Direct Account'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#0d9488', fontFamily: 'monospace' }}>
                        {t.customer?.bankAccountNumber || '•••• ••••'}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#475569' }}>{t.requestingBranchId}</span>
                      <span style={{ color: '#0d9488', margin: '0 0.35rem', fontWeight: 700 }}>&rarr;</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{t.fundingBranchId}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      LKR {t.requestedAmount.toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-badge status-${t.status.toLowerCase().replace(/_/g, '-')}`}>
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                      {t.bankReference || '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => onSelectTransfer(t)}
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        View Details
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
