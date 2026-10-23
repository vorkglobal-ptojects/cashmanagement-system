'use client';

import React, { useState } from 'react';
import { Send, X, AlertCircle } from 'lucide-react';
import { AuthSession } from '@/lib/types';

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  currentUser: AuthSession | null;
  onSuccess: () => void;
}

export default function NewTransferModal({
  isOpen,
  onClose,
  accounts,
  currentUser,
  onSuccess,
}: NewTransferModalProps) {
  const [transferType, setTransferType] = useState('BRANCH_TO_BRANCH');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(requestedAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid requested amount greater than 0');
      return;
    }

    if (!sourceAccountId || !destinationAccountId) {
      setError('Please select both source and destination accounts');
      return;
    }

    if (sourceAccountId === destinationAccountId) {
      setError('Source and Destination accounts cannot be the same');
      return;
    }

    if (!purpose.trim()) {
      setError('Operational purpose is required');
      return;
    }

    setLoading(true);
    try {
      const sourceAcc = accounts.find((a) => a.id === sourceAccountId);
      const destAcc = accounts.find((a) => a.id === destinationAccountId);

      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferType,
          sourceAccountId,
          destinationAccountId,
          fromBranchId: sourceAcc?.branchId ?? null,
          toBranchId: destAcc?.branchId ?? currentUser?.branchId ?? null,
          requestedAmount: amount,
          urgency,
          purpose,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit cash request');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '1.75rem',
        background: '#111827',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Send size={20} color="var(--primary-emerald)" />
            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>Create Cash Transfer Request</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#ef4444',
            fontSize: '0.85rem',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Transfer Type */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Transfer Category
            </label>
            <select
              value={transferType}
              onChange={(e) => setTransferType(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: '#fff',
                fontSize: '0.875rem',
              }}
            >
              <option value="BRANCH_TO_BRANCH" style={{ background: '#111827' }}>Branch-to-Branch Transfer</option>
              <option value="VAULT_TO_TILL" style={{ background: '#111827' }}>Vault to Cashier Till (Morning Float)</option>
              <option value="TILL_TO_VAULT" style={{ background: '#111827' }}>Cashier Till to Vault (Surplus Deposit)</option>
              <option value="BANK_WITHDRAWAL" style={{ background: '#111827' }}>Commercial Bank Cash Withdrawal</option>
              <option value="BANK_DEPOSIT" style={{ background: '#111827' }}>Bank Cash Deposit</option>
            </select>
          </div>

          {/* Accounts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Funding Source Account
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.825rem',
                }}
              >
                <option value="" style={{ background: '#111827' }}>-- Select Source --</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} style={{ background: '#111827' }}>
                    {acc.name} ({acc.type}) - LKR {acc.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Destination Account
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.825rem',
                }}
              >
                <option value="" style={{ background: '#111827' }}>-- Select Destination --</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} style={{ background: '#111827' }}>
                    {acc.name} ({acc.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Urgency */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Requested Amount (LKR)
              </label>
              <input
                type="number"
                step="1000"
                min="1"
                placeholder="e.g. 500000"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
              >
                <option value="NORMAL" style={{ background: '#111827' }}>Normal</option>
                <option value="HIGH" style={{ background: '#111827' }}>High Priority</option>
                <option value="CRITICAL" style={{ background: '#111827' }}>Critical / Rush</option>
              </select>
            </div>
          </div>

          {/* Operational Purpose */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Operational Justification & Purpose
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Replenishment for high-volume gold pawning disbursement settlements"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.75rem',
                color: '#fff',
                fontSize: '0.875rem',
                resize: 'none',
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Submitting...' : 'Submit Cash Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
