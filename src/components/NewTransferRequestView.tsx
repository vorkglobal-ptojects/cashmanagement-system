'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Save, X, Building2, User, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthSession, Customer } from '@/lib/types';

interface NewTransferRequestViewProps {
  branches: any[];
  customers: Customer[];
  currentUser: AuthSession | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NewTransferRequestView({
  branches,
  customers,
  currentUser,
  onSuccess,
  onCancel,
}: NewTransferRequestViewProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [requestingBranchId, setRequestingBranchId] = useState(currentUser?.branchId || 'BRL');
  const [fundingBranchId, setFundingBranchId] = useState('OFFICE');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const amountNum = parseFloat(requestedAmount.replace(/,/g, ''));
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount in LKR');
      return;
    }
    if (!selectedCustomerId) {
      setError('Please select a verified customer');
      return;
    }
    if (!reason.trim()) {
      setError('Please enter the business purpose / reason for this transfer');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/fund-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          requestingBranchId,
          fundingBranchId,
          requestedAmount: amountNum,
          reason: reason.trim(),
          priority,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit transfer request');

      setSuccessMsg(`Transfer request ${data.transfer.requestNumber} created successfully and queued for approval.`);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Dynamics 365 Command Bar */}
      <div className="d365-card" style={{
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ArrowRightLeft size={18} color="#0d9488" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            New Interbranch Fund Transfer Request
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            <X size={14} /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loading}
          >
            <Save size={14} /> {loading ? 'Submitting...' : 'Save & Submit Request'}
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

      {/* Form Content */}
      <div className="d365-card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: Customer Selection */}
          <div>
            <h3 style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#0d9488',
              marginBottom: '0.75rem',
              paddingBottom: '0.35rem',
              borderBottom: '1px solid #e2e8f0',
            }}>
              1. Customer Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="field-label">Select Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="field-input"
                  required
                >
                  <option value="">-- Choose registered customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.nicNumber})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.82rem',
                }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedCustomer.fullName}</div>
                  <div style={{ color: '#64748b', marginTop: '0.2rem' }}>
                    NIC: <strong style={{ color: '#0f172a' }}>{selectedCustomer.nicNumber}</strong>
                  </div>
                  <div style={{ color: '#64748b' }}>
                    Bank: <strong style={{ color: '#0f172a' }}>{selectedCustomer.bankName}</strong> ({selectedCustomer.bankBranch || 'Primary'})
                  </div>
                  <div style={{ color: '#64748b' }}>
                    Account: <strong style={{ color: '#0f172a' }}>{selectedCustomer.bankAccountNumber}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Transfer Routing */}
          <div>
            <h3 style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#0d9488',
              marginBottom: '0.75rem',
              paddingBottom: '0.35rem',
              borderBottom: '1px solid #e2e8f0',
            }}>
              2. Branch Routing &amp; Authorization
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="field-label">Requesting Branch *</label>
                <select
                  value={requestingBranchId}
                  onChange={(e) => setRequestingBranchId(e.target.value)}
                  className="field-input"
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Funding Branch (Source of Funds) *</label>
                <select
                  value={fundingBranchId}
                  onChange={(e) => setFundingBranchId(e.target.value)}
                  className="field-input"
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="field-input"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent (Immediate Processing)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Amount & Purpose */}
          <div>
            <h3 style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#0d9488',
              marginBottom: '0.75rem',
              paddingBottom: '0.35rem',
              borderBottom: '1px solid #e2e8f0',
            }}>
              3. Amount &amp; Purpose
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="field-label">Requested Amount (LKR) *</label>
                <input
                  type="number"
                  step="1000"
                  min="1000"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  className="field-input"
                  placeholder="e.g. 250000"
                  required
                />
              </div>

              <div>
                <label className="field-label">Business Purpose / Reason *</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="field-input"
                  placeholder="e.g. Customer gold loan disbursement / pledge release"
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
