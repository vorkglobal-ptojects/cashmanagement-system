'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Search, CheckCircle, AlertCircle, Building2, User } from 'lucide-react';
import { AuthSession, Customer } from '@/lib/types';

interface NewFundTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthSession | null;
  branches: any[];
  customers: Customer[];
  onSuccess: () => void;
}

export default function NewFundTransferModal({
  isOpen,
  onClose,
  currentUser,
  branches,
  customers,
  onSuccess,
}: NewFundTransferModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [requestingBranchId, setRequestingBranchId] = useState(currentUser?.branchId || 'BRL');
  const [fundingBranchId, setFundingBranchId] = useState(branches[0]?.id || 'OFFICE');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (branches.length > 0) {
      if (!fundingBranchId) setFundingBranchId(branches[0].id);
      if (!requestingBranchId) setRequestingBranchId(currentUser?.branchId || branches[0].id);
    }
  }, [branches, currentUser]);

  if (!isOpen) return null;

  // Filter customers by search term
  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.nicNumber.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedCustomerId) {
      setError('Please select a customer for this direct-to-customer bank transfer.');
      return;
    }

    if (requestingBranchId === fundingBranchId) {
      setError('Requesting branch and funding branch should be distinct for interbranch funding.');
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
          requestedAmount: parseFloat(requestedAmount),
          reason,
          additionalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit fund transfer request');
      }

      setSuccessMsg(`Transfer Request ${data.transfer.id} submitted for approval.`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(7, 13, 24, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0c1427',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        padding: '2rem',
        position: 'relative',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          }}>
            <ArrowRightLeft size={22} color="#34d399" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              New Interbranch Funding Request
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Request funding from any branch for a direct-to-customer bank transfer
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            color: '#34d399',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Customer Selection */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
              Select Customer for Transfer *
            </label>
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search registered customer by Name, NIC, or Customer ID..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <select
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              style={{
                width: '100%',
                background: '#111827',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#fff',
                fontSize: '0.875rem',
              }}
            >
              <option value="">-- Choose Registered Customer --</option>
              {filteredCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} [{c.id}] — NIC: {c.nicNumber} ({c.bankName})
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div style={{
                marginTop: '0.65rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    {selectedCustomer.fullName} ({selectedCustomer.id})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Bank: <strong style={{ color: '#34d399' }}>{selectedCustomer.bankName}</strong> ({selectedCustomer.bankBranch}) • A/C: {selectedCustomer.bankAccountNumber}
                  </div>
                </div>
                <span className="badge badge-completed">Verified Beneficiary</span>
              </div>
            )}
          </div>

          {/* Interbranch Routing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                Requesting Branch (Origin) *
              </label>
              <select
                value={requestingBranchId}
                onChange={(e) => setRequestingBranchId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                Funding Branch (Source of Liquidity) *
              </label>
              <select
                value={fundingBranchId}
                onChange={(e) => setFundingBranchId(e.target.value)}
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#22d3ee',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Any branch can fund any branch dynamically
              </span>
            </div>
          </div>

          {/* Transfer Amount & Purpose */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                Requested Amount (LKR) *
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="e.g. 350000.00"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#34d399',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                Reason for Transfer *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Urgent customer disbursement for trade settlement"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
              Additional Notes or Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Customer requires LankaPay CEFT transfer before 3:00 PM cutoff"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                color: '#fff',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.65rem 1.25rem',
                color: '#cbd5e1',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '0.65rem 1.5rem' }}
            >
              <ArrowRightLeft size={16} />
              <span>{loading ? 'Submitting Request...' : 'Submit Transfer Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
