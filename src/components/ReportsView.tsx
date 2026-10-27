'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Building2, 
  TrendingUp, 
  CheckCircle, 
  CreditCard 
} from 'lucide-react';
import { AuthSession, FundTransferRequest } from '@/lib/types';

interface ReportsViewProps {
  transfers: FundTransferRequest[];
  branches: any[];
  currentUser: AuthSession | null;
}

export default function ReportsView({
  transfers,
  branches,
  currentUser,
}: ReportsViewProps) {
  const [selectedBranch, setSelectedBranch] = useState('All');

  const filtered = transfers.filter((t) => {
    if (selectedBranch === 'All') return true;
    return t.requestingBranchId === selectedBranch || t.fundingBranchId === selectedBranch;
  });

  const totalVolume = filtered.reduce((acc, t) => acc + t.requestedAmount, 0);
  const completedVolume = filtered
    .filter((t) => t.status === 'COMPLETED')
    .reduce((acc, t) => acc + (t.actualAmountPaid || t.requestedAmount), 0);

  // Method breakdown
  const ceftCount = filtered.filter((t) => t.paymentMethod === 'CEFT').length;
  const slipsCount = filtered.filter((t) => t.paymentMethod === 'SLIPS').length;
  const rtgsCount = filtered.filter((t) => t.paymentMethod === 'RTGS').length;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Request Number',
      'Date',
      'Customer Name',
      'Bank Name',
      'Requesting Branch',
      'Funding Branch',
      'Requested Amount (LKR)',
      'Actual Paid (LKR)',
      'Method',
      'Bank Reference',
      'Status',
    ];
    const rows = filtered.map((t) => [
      t.requestNumber,
      new Date(t.createdAt).toISOString().split('T')[0],
      `"${t.customerName}"`,
      `"${t.bankName}"`,
      t.requestingBranchId,
      t.fundingBranchId,
      t.requestedAmount,
      t.actualAmountPaid || 0,
      t.paymentMethod || 'N/A',
      `"${t.bankReference || 'N/A'}"`,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fund_transfers_report_${new Date().toISOString().split('T')[0]}.csv`);
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
          <BarChart3 size={18} color="#0d9488" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Institutional Liquidity &amp; Transfer Reports
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-secondary"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Row (Dynamics 365 Clean Style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="d365-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Total Requested Volume
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>
            LKR {totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {filtered.length} funding requests total
          </div>
        </div>

        <div className="d365-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>
            Total Disbursed &amp; Settled
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#166534', margin: '0.3rem 0' }}>
            LKR {completedVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Fully verified with bank receipts
          </div>
        </div>

        <div className="d365-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', textTransform: 'uppercase' }}>
            Payment Rails Breakdown
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0.3rem 0', display: 'flex', gap: '0.75rem' }}>
            <span>CEFT: {ceftCount}</span>
            <span>SLIPS: {slipsCount}</span>
            <span>RTGS: {rtgsCount}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Standard direct interbank protocols
          </div>
        </div>
      </div>

      {/* Branch Liquidity Table */}
      <div className="d365-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
          Branch Disbursal Summary
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="d365-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Code</th>
                <th>Requests In</th>
                <th>Funding Provided</th>
                <th>Disbursed Total (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => {
                const branchTransfers = transfers.filter(
                  (t) => t.fundingBranchId === b.id && t.status === 'COMPLETED'
                );
                const branchTotal = branchTransfers.reduce(
                  (sum, t) => sum + (t.actualAmountPaid || t.requestedAmount),
                  0
                );
                const reqInCount = transfers.filter((t) => t.requestingBranchId === b.id).length;
                const fundedCount = transfers.filter((t) => t.fundingBranchId === b.id).length;

                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{b.name}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0d9488' }}>
                        {b.code}
                      </span>
                    </td>
                    <td>{reqInCount}</td>
                    <td>{fundedCount}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      LKR {branchTotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
