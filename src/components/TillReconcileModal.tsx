'use client';

import React, { useState } from 'react';
import { Wallet, X, AlertTriangle, Calculator, CheckCircle2 } from 'lucide-react';
import DenominationModal from './DenominationModal';
import { DenominationBreakdown } from '@/lib/types';
import { calculateTallyTotal } from '@/lib/tallies';

interface TillReconcileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onSuccess: () => void;
}

export default function TillReconcileModal({
  isOpen,
  onClose,
  session,
  onSuccess,
}: TillReconcileModalProps) {
  const [tally, setTally] = useState<DenominationBreakdown | null>(null);
  const [isTallyModalOpen, setIsTallyModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !session) return null;

  const expectedAmount = session.expectedClosingBalance || session.openingBalance;
  const countedTotal = tally ? calculateTallyTotal(tally) : 0;
  const variance = tally ? Math.round((countedTotal - expectedAmount) * 100) / 100 : 0;
  const hasCount = tally !== null;
  const isMatch = hasCount && Math.abs(variance) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tally) {
      setError('Physical closing denomination count is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tills/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          tally,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reconcile till session');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during till reconciliation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
          maxWidth: '540px',
          padding: '1.75rem',
          background: '#111827',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Wallet size={20} color="var(--primary-emerald)" />
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>End of Day Till Reconciliation</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Session: {session.sessionCode} ({session.tillAccount?.name})
                </span>
              </div>
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
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Reconciliation Balance Grid */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            border: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Calculated Balance</span>
              <div className="amount-lkr" style={{ fontSize: '1.25rem', color: '#fff' }}>
                LKR {expectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Physical Count Result</span>
              <div className="amount-lkr" style={{ fontSize: '1.25rem', color: !hasCount ? 'var(--text-subtle)' : isMatch ? 'var(--primary-emerald)' : 'var(--accent-red)' }}>
                {hasCount ? `LKR ${countedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Pending Count'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Launch Denomination Counter */}
            <div>
              <button
                type="button"
                onClick={() => setIsTallyModalOpen(true)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: hasCount ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: `1px solid ${hasCount ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  color: hasCount ? 'var(--primary-emerald)' : 'var(--accent-gold)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <Calculator size={18} />
                <span>{hasCount ? '✓ Physical Count Recorded (Click to Adjust)' : 'Open Denomination Counter & Count Till'}</span>
              </button>
            </div>

            {/* Match or Variance Status Card */}
            {hasCount && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: isMatch ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${isMatch ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
              }}>
                {isMatch ? (
                  <>
                    <CheckCircle2 size={18} color="var(--primary-emerald)" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--primary-emerald)', fontSize: '0.85rem' }}>
                        Till Perfectly Balanced (0.00 Variance)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        All physical notes and coins equal the system ledger.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} color="var(--accent-red)" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                        Variance: {variance > 0 ? `+LKR ${variance.toLocaleString()} (Cash Overage)` : `-LKR ${Math.abs(variance).toLocaleString()} (Cash Shortage)`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Automatic variance adjustment journal voucher will be posted to the General Ledger.
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reconciliation notes */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Cashier End-of-Day Notes / Supervisor Signature
              </label>
              <textarea
                rows={2}
                placeholder="Till counted and verified at shift close."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.55rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.875rem',
                  resize: 'none',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !hasCount}
                className="btn-primary"
              >
                {loading ? 'Reconciling...' : 'Confirm Reconciliation & Close Till'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Denomination Counter Modal */}
      <DenominationModal
        isOpen={isTallyModalOpen}
        onClose={() => setIsTallyModalOpen(false)}
        title="Physical Till Closing Cash Count"
        expectedAmount={expectedAmount}
        confirmLabel="Save Closing Count"
        onConfirm={(recordedTally) => {
          setTally(recordedTally);
          setIsTallyModalOpen(false);
        }}
      />
    </>
  );
}
