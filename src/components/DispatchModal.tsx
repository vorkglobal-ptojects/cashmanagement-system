'use client';

import React, { useState } from 'react';
import { Truck, X, AlertCircle, Calculator } from 'lucide-react';
import DenominationModal from './DenominationModal';
import { DenominationBreakdown } from '@/lib/types';
import { calculateTallyTotal } from '@/lib/tallies';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: any;
  onSuccess: () => void;
}

export default function DispatchModal({
  isOpen,
  onClose,
  transfer,
  onSuccess,
}: DispatchModalProps) {
  const [securityBagNumber, setSecurityBagNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('WP-CAD-4920');
  const [courierName, setCourierName] = useState('Certis Lanka Cash Transit');
  const [courierNic, setCourierNic] = useState('198429104928');
  const [waybillNumber, setWaybillNumber] = useState('');
  const [tally, setTally] = useState<DenominationBreakdown | null>(null);
  const [isTallyModalOpen, setIsTallyModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transfer) return null;

  const expectedAmount = transfer.approvedAmount || transfer.requestedAmount;
  const tallyTotal = tally ? calculateTallyTotal(tally) : 0;
  const isTallyValid = tally && Math.abs(tallyTotal - expectedAmount) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!securityBagNumber.trim()) {
      setError('Physical security seal/bag serial number is mandatory for audit compliance');
      return;
    }

    if (!tally || !isTallyValid) {
      setError(`Please complete denomination tally matching LKR ${expectedAmount.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/transfers/${transfer.id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tally,
          securityBagNumber: securityBagNumber.trim(),
          vehicleNumber: vehicleNumber.trim(),
          courierName: courierName.trim(),
          courierNic: courierNic.trim(),
          waybillNumber: waybillNumber.trim() || `WB-${Date.now().toString().slice(-6)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch cash');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during dispatch');
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
              <Truck size={20} color="var(--accent-purple)" />
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>Dispatch Cash Shipment</h3>
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
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved Cash to Dispatch</span>
              <div className="amount-lkr" style={{ fontSize: '1.25rem', color: '#fff' }}>
                LKR {expectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Physical Count Total</span>
              <div className="amount-lkr" style={{ fontSize: '1.25rem', color: isTallyValid ? 'var(--primary-emerald)' : 'var(--accent-gold)' }}>
                {tally ? `LKR ${tallyTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Pending Count'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Denomination Trigger Button */}
            <div>
              <button
                type="button"
                onClick={() => setIsTallyModalOpen(true)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: isTallyValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: `1px solid ${isTallyValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  color: isTallyValid ? 'var(--primary-emerald)' : 'var(--accent-gold)',
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
                <span>{isTallyValid ? '✓ Denomination Count Verified (Click to Edit)' : 'Record & Verify Denomination Breakdown'}</span>
              </button>
            </div>

            {/* Security Seal Bag # and Waybill # */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Tamper-Evident Bag Seal # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEC-BAG-99482"
                  value={securityBagNumber}
                  onChange={(e) => setSecurityBagNumber(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Waybill / Consignment #
                </label>
                <input
                  type="text"
                  placeholder="e.g. WB-2026-00492"
                  value={waybillNumber}
                  onChange={(e) => setWaybillNumber(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Security Transport Courier & Vehicle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Armored Transport / Courier
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Vehicle Reg #
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.55rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Officer NIC */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Handover Transit Officer NIC
              </label>
              <input
                type="text"
                value={courierNic}
                onChange={(e) => setCourierNic(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.55rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.875rem',
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
                disabled={loading || !isTallyValid || !securityBagNumber.trim()}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              >
                {loading ? 'Posting GL & Dispatching...' : 'Confirm Handover & Dispatch'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Denomination Counter Modal */}
      <DenominationModal
        isOpen={isTallyModalOpen}
        onClose={() => setIsTallyModalOpen(false)}
        title="Physical Cash Handover Denomination Count"
        expectedAmount={expectedAmount}
        confirmLabel="Save Dispatch Count"
        onConfirm={(recordedTally) => {
          setTally(recordedTally);
          setIsTallyModalOpen(false);
        }}
      />
    </>
  );
}
