'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  PlusCircle, 
  Calculator, 
  Lock, 
  RefreshCw 
} from 'lucide-react';
import { AuthSession } from '@/lib/types';
import TillReconcileModal from './TillReconcileModal';
import DenominationModal from './DenominationModal';
import { DenominationBreakdown } from '@/lib/types';
import { calculateTallyTotal } from '@/lib/tallies';

interface TillsViewProps {
  currentUser: AuthSession | null;
  accounts: any[];
}

export default function TillsView({ currentUser, accounts }: TillsViewProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconcileTarget, setReconcileTarget] = useState<any | null>(null);
  
  // Open till state
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [selectedTillId, setSelectedTillId] = useState('');
  const [openNotes, setOpenNotes] = useState('');
  const [openTally, setOpenTally] = useState<DenominationBreakdown | null>(null);
  const [isTallyOpenForOpen, setIsTallyOpenForOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tillAccounts = accounts.filter((a) => a.type === 'TILL');

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tills');
      const data = await res.json();
      if (res.ok) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to fetch till sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleOpenTillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTillId) {
      setError('Please select a till account');
      return;
    }

    if (!openTally) {
      setError('Please count and record opening denomination float');
      return;
    }

    try {
      const res = await fetch('/api/tills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tillAccountId: selectedTillId,
          tally: openTally,
          notes: openNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to open till session');
      }

      setIsOpenModalOpen(false);
      setOpenTally(null);
      setOpenNotes('');
      fetchSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string, variance: number) => {
    switch (status) {
      case 'OPEN':
        return <span className="badge badge-in-transit pulse-badge">Active Open</span>;
      case 'BALANCED':
        return <span className="badge badge-accepted">Balanced (0.00)</span>;
      case 'SHORT':
        return <span className="badge badge-discrepancy">Short (-LKR {Math.abs(variance).toLocaleString()})</span>;
      case 'OVER':
        return <span className="badge badge-requested">Over (+LKR {variance.toLocaleString()})</span>;
      default:
        return <span className="badge badge-rejected">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            Till Floats & Shift Reconciliations
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Cash counter opening float verification, daily cash balancing, and automatic Over/Short variance adjustments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchSessions} className="btn-secondary" title="Refresh Sessions">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          {['CASHIER', 'BRANCH_MANAGER', 'SYSTEM_ADMIN'].includes(currentUser?.role || '') && (
            <button onClick={() => setIsOpenModalOpen(true)} className="btn-primary">
              <PlusCircle size={16} />
              <span>Open New Till Shift</span>
            </button>
          )}
        </div>
      </div>

      {/* Till Sessions Table */}
      <div className="glass-card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Session Code</th>
              <th style={{ padding: '0.85rem 1rem' }}>Till Account</th>
              <th style={{ padding: '0.85rem 1rem' }}>Cashier</th>
              <th style={{ padding: '0.85rem 1rem' }}>Opening Float</th>
              <th style={{ padding: '0.85rem 1rem' }}>Expected Closing</th>
              <th style={{ padding: '0.85rem 1rem' }}>Actual Physical</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status & Variance</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
                  No till sessions recorded yet. Open a new till shift to start counter transactions.
                </td>
              </tr>
            ) : (
              sessions.map((s) => {
                const isOpen = s.status === 'OPEN';
                const canClose = isOpen && (currentUser?.role === 'SYSTEM_ADMIN' || currentUser?.userId === s.cashierUserId || currentUser?.role === 'BRANCH_MANAGER');

                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                      <div>{s.sessionCode}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {new Date(s.openedAt).toLocaleTimeString()} ({new Date(s.openedAt).toLocaleDateString()})
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#fff' }}>
                      {s.tillAccount?.name} ({s.branch?.city})
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {s.cashierUsername}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="amount-lkr" style={{ color: '#fff' }}>
                        LKR {s.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="amount-lkr" style={{ color: '#fff' }}>
                        LKR {(s.expectedClosingBalance || s.openingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="amount-lkr" style={{ color: s.actualClosingBalance !== null ? 'var(--primary-emerald)' : 'var(--text-subtle)' }}>
                        {s.actualClosingBalance !== null ? `LKR ${s.actualClosingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'In Progress'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getStatusBadge(s.status, s.variance)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {canClose && (
                        <button
                          onClick={() => setReconcileTarget(s)}
                          className="btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          <Lock size={14} />
                          <span>Count & Reconcile</span>
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

      {/* Reconcile Modal */}
      {reconcileTarget && (
        <TillReconcileModal
          isOpen={true}
          session={reconcileTarget}
          onClose={() => setReconcileTarget(null)}
          onSuccess={() => {
            setReconcileTarget(null);
            fetchSessions();
          }}
        />
      )}

      {/* Open Till Modal */}
      {isOpenModalOpen && (
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem', background: '#111827' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>
              Open Cash Counter Till Shift
            </h3>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem',
                marginBottom: '1rem',
                color: '#ef4444',
                fontSize: '0.85rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleOpenTillSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Select Counter Till Account
                </label>
                <select
                  required
                  value={selectedTillId}
                  onChange={(e) => setSelectedTillId(e.target.value)}
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
                  <option value="" style={{ background: '#111827' }}>-- Select Till --</option>
                  {tillAccounts.map((t) => (
                    <option key={t.id} value={t.id} style={{ background: '#111827' }}>
                      {t.name} (Current: LKR {t.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tally Trigger */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsTallyOpenForOpen(true)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: openTally ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                    border: `1px solid ${openTally ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
                    color: openTally ? 'var(--primary-emerald)' : '#06b6d4',
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
                  <span>
                    {openTally
                      ? `✓ Opening Count: LKR ${calculateTallyTotal(openTally).toLocaleString()} (Edit)`
                      : 'Count Physical Opening Float Notes'}
                  </span>
                </button>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Opening Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Morning counter opening float verified."
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsOpenModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={!selectedTillId || !openTally} className="btn-primary">
                  Confirm & Open Till Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Opening Denomination Modal */}
      <DenominationModal
        isOpen={isTallyOpenForOpen}
        onClose={() => setIsTallyOpenForOpen(false)}
        title="Physical Opening Float Denomination Count"
        confirmLabel="Confirm Opening Count"
        onConfirm={(recorded) => {
          setOpenTally(recorded);
          setIsTallyOpenForOpen(false);
        }}
      />
    </div>
  );
}
