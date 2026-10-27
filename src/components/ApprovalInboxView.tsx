'use client';

import React, { useState } from 'react';
import { 
  Inbox, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  AlertCircle,
  Eye,
  Check,
  X
} from 'lucide-react';
import { AuthSession, FundTransferRequest } from '@/lib/types';

interface ApprovalInboxViewProps {
  transfers: FundTransferRequest[];
  currentUser: AuthSession | null;
  onSelectTransfer: (transfer: FundTransferRequest) => void;
  onRefresh: () => void;
}

export default function ApprovalInboxView({
  transfers,
  currentUser,
  onSelectTransfer,
  onRefresh,
}: ApprovalInboxViewProps) {
  const pendingRequests = transfers.filter((t) => t.status === 'PENDING_APPROVAL');

  const [decisionNotes, setDecisionNotes] = useState<{ [id: string]: string }>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isApprover =
    currentUser?.role === 'MAIN_ADMIN' ||
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'BRANCH_MANAGER';

  const handleDecision = async (transferId: string, decision: 'APPROVE' | 'REJECT') => {
    setError(null);
    setProcessingId(transferId);

    try {
      const res = await fetch(`/api/fund-transfers/${transferId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          notes: decisionNotes[transferId] || '',
          rejectionReason: decision === 'REJECT' ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process decision');

      setRejectingId(null);
      setRejectionReason('');
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              Approval Inbox
            </h2>
            <span style={{
              background: '#f59e0b',
              color: '#070d18',
              fontWeight: 800,
              fontSize: '0.75rem',
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
            }}>
              {pendingRequests.length} Pending
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
            Review incoming funding requests across all branches. Either an authorized Manager or Mr. Sanjay can authorize.
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '8px',
          padding: '0.75rem',
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

      {/* Inbox Items */}
      {pendingRequests.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8' }}>
          <CheckCircle size={40} color="#34d399" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
            Approval Inbox is Clear!
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
            All interbranch funding requests have been decided. New requests submitted by branch employees will appear here in real time.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingRequests.map((t) => (
            <div
              key={t.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                borderLeft: '4px solid #f59e0b',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{t.id}</span>
                    <span className="badge badge-pending"><Clock size={12} /> Pending Authorization</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Requested on {new Date(t.requestDate).toLocaleString()} by <strong style={{ color: '#fff' }}>{t.requestingUserName}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Requested Amount</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34d399' }}>
                    LKR {t.requestedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.825rem',
              }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Customer (Beneficiary):</span>
                  <div style={{ fontWeight: 700, color: '#fff', marginTop: '0.15rem' }}>
                    {t.customer?.fullName} [{t.customerId}]
                  </div>
                  <div style={{ color: '#38bdf8', fontSize: '0.75rem' }}>
                    NIC: {t.customer?.nicNumber}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Direct Bank Account:</span>
                  <div style={{ fontWeight: 700, color: '#22d3ee', marginTop: '0.15rem' }}>
                    {t.customer?.bankName} ({t.customer?.bankBranch})
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
                    A/C: {t.customer?.bankAccountNumber}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Interbranch Routing:</span>
                  <div style={{ color: '#fff', marginTop: '0.15rem', fontWeight: 600 }}>
                    {t.requestingBranch?.name} &rarr; <strong style={{ color: '#06b6d4' }}>{t.fundingBranch?.name}</strong>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    Funding Source: {t.fundingBranch?.name}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Purpose &amp; Reason:</span>
                  <div style={{ color: '#f1f5f9', marginTop: '0.15rem' }}>{t.reason}</div>
                  {t.additionalNotes && (
                    <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>
                      {t.additionalNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              {isApprover && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem' }}>
                  {rejectingId === t.id ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        type="text"
                        required
                        placeholder="Specify mandatory reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          padding: '0.55rem 0.85rem',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          className="btn-secondary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!rejectionReason.trim() || processingId === t.id}
                          onClick={() => handleDecision(t.id, 'REJECT')}
                          className="btn-danger"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <input
                          type="text"
                          placeholder="Optional internal treasury note or reference..."
                          value={decisionNotes[t.id] || ''}
                          onChange={(e) => setDecisionNotes({ ...decisionNotes, [t.id]: e.target.value })}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '0.45rem 0.75rem',
                            color: '#fff',
                            fontSize: '0.8rem',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => onSelectTransfer(t)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#cbd5e1',
                            borderRadius: '8px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <Eye size={14} /> Full Details
                        </button>

                        <button
                          type="button"
                          onClick={() => setRejectingId(t.id)}
                          className="btn-secondary"
                          style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        >
                          <X size={14} /> Reject
                        </button>

                        <button
                          type="button"
                          disabled={processingId === t.id}
                          onClick={() => handleDecision(t.id, 'APPROVE')}
                          className="btn-primary"
                          style={{ padding: '0.45rem 1.15rem', fontSize: '0.8rem' }}
                        >
                          <Check size={14} />
                          <span>{processingId === t.id ? 'Processing...' : 'Approve Request'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
