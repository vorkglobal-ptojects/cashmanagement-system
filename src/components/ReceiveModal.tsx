'use client';

import React, { useState } from 'react';
import { PackageCheck, X, AlertTriangle, Calculator, ShieldCheck } from 'lucide-react';
import DenominationModal from './DenominationModal';
import { DenominationBreakdown } from '@/lib/types';
import { calculateTallyTotal } from '@/lib/tallies';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: any;
  onSuccess: () => void;
}

export default function ReceiveModal({
  isOpen,
  onClose,
  transfer,
  onSuccess,
}: ReceiveModalProps) {
  const [tally, setTally] = useState<DenominationBreakdown | null>(null);
  const [isTallyModalOpen, setIsTallyModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transfer) return null;

  const dispatchedAmount = transfer.dispatchedAmount || transfer.approvedAmount || transfer.requestedAmount;
  const countedTotal = tally ? calculateTallyTotal(tally) : 0;
  const variance = tally ? Math.round((countedTotal - dispatchedAmount) * 100) / 100 : 0;
  const hasCount = tally !== null;
  const isDiscrepancy = hasCount && Math.abs(variance) >= 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tally) {
      setError('You must complete the independent denomination count before receiving cash');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/transfers/${transfer.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tally,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to receive cash shipment');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during cash receipt');
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
          maxWidth: '560px',
          padding: '1.75rem',
          background: '#111827',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <PackageCheck size={20} color="var(--primary-emerald)" />
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>Receive & Count Cash Shipment</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Transfer Ref: {transfer.transferNumber}
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

          {/* Shipment Waybill Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.825rem',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <span style={{ color: 'var(--text-subtle)' }}>Security Bag Seal #:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{transfer.securityBagNumber || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-subtle)' }}>Waybill / Consignment #:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{transfer.waybillNumber || 'N/A'}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <span style={{ color: 'var(--text-subtle)' }}>Dispatched By:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{transfer.dispatchedByUsername || 'Custodian'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-subtle)' }}>Courier / Vehicle:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{transfer.courierName || 'Armored Transport'} ({transfer.vehicleNumber || 'WP'})</div>
              </div>
            </div>
          </div>

          {/* Financial Count Review */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Waybill Dispatched Sum</span>
              <div className="amount-lkr" style={{ fontSize: '1.25rem', color: '#fff' }}>
                LKR {dispatchedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Independent Count Total</span>
              <div className="amount-lkr" style={{ fontSize: '1.25rem', color: !hasCount ? 'var(--text-subtle)' : isDiscrepancy ? 'var(--accent-red)' : 'var(--primary-emerald)' }}>
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
                  background: hasCount ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                  border: `1px solid ${hasCount ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
                  color: hasCount ? 'var(--primary-emerald)' : '#06b6d4',
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
                <span>{hasCount ? '✓ Denomination Count Recorded (Click to Re-count)' : 'Open Denomination Matrix & Count Cash'}</span>
              </button>
            </div>

            {/* Discrepancy warning banner */}
            {isDiscrepancy && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
              }}>
                <AlertTriangle size={18} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                    Variance Detected: LKR {Math.abs(variance).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({variance > 0 ? 'Surplus / Over' : 'Shortage'})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Accepting this shipment will automatically flag it as <strong>DISCREPANCY_FLAGGED</strong>, post variance GL entries, and notify Internal Audit.
                  </div>
                </div>
              </div>
            )}

            {/* Officer Observation Notes */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Receiving Officer Observation / Notes
              </label>
              <textarea
                rows={2}
                placeholder="Bag seal intact upon receipt. Notes verified and counted under CCTV."
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
                className={isDiscrepancy ? 'btn-danger' : 'btn-primary'}
              >
                {loading ? 'Processing Receipt...' : isDiscrepancy ? 'Flag Discrepancy & Receive' : 'Accept & Credit Vault/Till'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Denomination Counter Modal */}
      <DenominationModal
        isOpen={isTallyModalOpen}
        onClose={() => setIsTallyModalOpen(false)}
        title="Receiving Officer Physical Count"
        expectedAmount={dispatchedAmount}
        confirmLabel="Record Physical Count"
        onConfirm={(recordedTally) => {
          setTally(recordedTally);
          setIsTallyModalOpen(false);
        }}
      />
    </>
  );
}
