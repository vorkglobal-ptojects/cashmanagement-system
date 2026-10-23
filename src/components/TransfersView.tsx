'use client';

import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  PackageCheck, 
  AlertTriangle, 
  Clock, 
  PlusCircle, 
  FileText, 
  Eye, 
  X 
} from 'lucide-react';
import { AuthSession } from '@/lib/types';
import DispatchModal from './DispatchModal';
import ReceiveModal from './ReceiveModal';

interface TransfersViewProps {
  transfers: any[];
  currentUser: AuthSession | null;
  onOpenNewTransfer: () => void;
  onRefresh: () => void;
}

export default function TransfersView({
  transfers,
  currentUser,
  onOpenNewTransfer,
  onRefresh,
}: TransfersViewProps) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null);
  const [dispatchTarget, setDispatchTarget] = useState<any | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalTarget, setRejectModalTarget] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredTransfers = transfers.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  // Handle Approve
  const handleApprove = async (transferId: string) => {
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await fetch(`/api/transfers/${transferId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve request');
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject
  const handleRejectConfirm = async () => {
    if (!rejectModalTarget || !rejectionReason.trim()) return;
    setActionError(null);
    setActionLoading(true);
    try {
      const res = await fetch(`/api/transfers/${rejectModalTarget.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject request');
      setRejectModalTarget(null);
      setRejectionReason('');
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return <span className="badge badge-requested">Requested</span>;
      case 'APPROVED':
        return <span className="badge badge-approved">Approved</span>;
      case 'IN_TRANSIT':
        return <span className="badge badge-in-transit pulse-badge">In Transit</span>;
      case 'ACCEPTED':
        return <span className="badge badge-accepted">Accepted</span>;
      case 'DISCREPANCY_FLAGGED':
        return <span className="badge badge-discrepancy">Discrepancy</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">Rejected</span>;
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
            Cash Movements & Transit Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Dual-custody workflows, authorization checks, security waybills, and physical denomination tallies.
          </p>
        </div>
        {currentUser?.role !== 'AUDITOR' && (
          <button onClick={onOpenNewTransfer} className="btn-primary">
            <PlusCircle size={16} />
            <span>New Cash Request</span>
          </button>
        )}
      </div>

      {actionError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#ef4444',
          fontSize: '0.875rem',
        }}>
          <AlertTriangle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Transfers' },
          { id: 'REQUESTED', label: 'Requested (Pending Approval)' },
          { id: 'APPROVED', label: 'Approved (Pending Dispatch)' },
          { id: 'IN_TRANSIT', label: 'In Transit' },
          { id: 'ACCEPTED', label: 'Accepted (Completed)' },
          { id: 'DISCREPANCY_FLAGGED', label: 'Discrepancies' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: statusFilter === tab.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: statusFilter === tab.id ? 'var(--primary-emerald)' : 'var(--text-muted)',
              fontSize: '0.825rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transfers List */}
      <div className="glass-card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Transfer #</th>
              <th style={{ padding: '0.85rem 1rem' }}>Type</th>
              <th style={{ padding: '0.85rem 1rem' }}>Source / Destination</th>
              <th style={{ padding: '0.85rem 1rem' }}>Amount (LKR)</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem' }}>Actors & Custody</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
                  No cash transfers found matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredTransfers.map((t) => {
                const amount = t.approvedAmount || t.requestedAmount;
                const canApprove =
                  t.status === 'REQUESTED' &&
                  ['FINANCE_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER'].includes(currentUser?.role || '') &&
                  t.requestedByUserId !== currentUser?.userId;

                const canDispatch =
                  t.status === 'APPROVED' &&
                  ['DISPATCHER', 'FINANCE_ADMIN', 'SYSTEM_ADMIN'].includes(currentUser?.role || '');

                const canReceive =
                  t.status === 'IN_TRANSIT' &&
                  ['RECEIVING_OFFICER', 'BRANCH_MANAGER', 'SYSTEM_ADMIN'].includes(currentUser?.role || '') &&
                  t.dispatchedByUserId !== currentUser?.userId;

                return (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {/* Transfer # */}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                      <div>{t.transferNumber}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {new Date(t.requestedAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {t.transferType.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Source / Destination */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#fff', fontSize: '0.825rem' }}>{t.sourceAccount?.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        ➔ {t.destinationAccount?.name}
                      </div>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="amount-lkr" style={{ color: 'var(--primary-emerald)', fontSize: '0.95rem' }}>
                        LKR {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getStatusBadge(t.status)}
                    </td>

                    {/* Actors */}
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div>Req: {t.requestedByUsername}</div>
                      {t.approvedByUsername && <div>App: {t.approvedByUsername}</div>}
                      {t.dispatchedByUsername && <div>Disp: {t.dispatchedByUsername}</div>}
                      {t.receivedByUsername && <div>Rec: {t.receivedByUsername}</div>}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                        {/* Approve Button */}
                        {canApprove && (
                          <>
                            <button
                              onClick={() => handleApprove(t.id)}
                              disabled={actionLoading}
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              title="Approve Cash Request"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => setRejectModalTarget(t)}
                              disabled={actionLoading}
                              className="btn-danger"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              title="Reject Request"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* Dispatch Button */}
                        {canDispatch && (
                          <button
                            onClick={() => setDispatchTarget(t)}
                            className="btn-primary"
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                            }}
                          >
                            <Truck size={14} />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {/* Receive Button */}
                        {canReceive && (
                          <button
                            onClick={() => setReceiveTarget(t)}
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            <PackageCheck size={14} />
                            <span>Receive & Count</span>
                          </button>
                        )}

                        {/* Details Modal Trigger */}
                        <button
                          onClick={() => setSelectedTransfer(t)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="View Transfer Details, Waybill & GL Vouchers"
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dispatch Modal */}
      {dispatchTarget && (
        <DispatchModal
          isOpen={true}
          transfer={dispatchTarget}
          onClose={() => setDispatchTarget(null)}
          onSuccess={() => {
            setDispatchTarget(null);
            onRefresh();
          }}
        />
      )}

      {/* Receive Modal */}
      {receiveTarget && (
        <ReceiveModal
          isOpen={true}
          transfer={receiveTarget}
          onClose={() => setReceiveTarget(null)}
          onSuccess={() => {
            setReceiveTarget(null);
            onRefresh();
          }}
        />
      )}

      {/* Reject Modal */}
      {rejectModalTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '1.5rem', background: '#111827' }}>
            <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
              Reject Cash Request ({rejectModalTarget.transferNumber})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Financial audit regulations require a clear operational reason for request cancellation or rejection.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Branch till balance exceeds limit; request delayed to tomorrow"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem',
                color: '#fff',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setRejectModalTarget(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                disabled={!rejectionReason.trim() || actionLoading}
                onClick={handleRejectConfirm}
                className="btn-danger"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Details Drawer / Dialog */}
      {selectedTransfer && (
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
            maxWidth: '680px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '1.75rem',
            background: '#111827',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} color="var(--primary-emerald)" />
                <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 600 }}>
                  Transfer Voucher: {selectedTransfer.transferNumber}
                </h3>
              </div>
              <button onClick={() => setSelectedTransfer(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Stepper Status Progression */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)',
            }}>
              {['REQUESTED', 'APPROVED', 'DISPATCHED', 'IN_TRANSIT', 'ACCEPTED'].map((st, idx) => {
                const isPassed =
                  (selectedTransfer.status === 'ACCEPTED' && idx <= 4) ||
                  (selectedTransfer.status === 'IN_TRANSIT' && idx <= 3) ||
                  (selectedTransfer.status === 'APPROVED' && idx <= 1) ||
                  (selectedTransfer.status === 'REQUESTED' && idx === 0);

                return (
                  <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isPassed ? 'var(--primary-emerald)' : 'rgba(255, 255, 255, 0.1)',
                      color: isPassed ? '#fff' : 'var(--text-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: isPassed ? '#fff' : 'var(--text-subtle)' }}>
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Core Info Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>From Account:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{selectedTransfer.sourceAccount?.name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>To Account:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{selectedTransfer.destinationAccount?.name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Approved Cash Sum:</span>
                <div className="amount-lkr" style={{ color: 'var(--primary-emerald)', fontSize: '1.1rem' }}>
                  LKR {(selectedTransfer.approvedAmount || selectedTransfer.requestedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Operational Purpose:</span>
                <div style={{ color: '#fff' }}>{selectedTransfer.purpose}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Security Bag Seal #:</span>
                <div style={{ color: '#fff', fontWeight: 600 }}>{selectedTransfer.securityBagNumber || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Waybill #:</span>
                <div style={{ color: '#fff', fontWeight: 600 }}>{selectedTransfer.waybillNumber || 'N/A'}</div>
              </div>
            </div>

            {/* Linked Balanced GL Journal Vouchers */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem' }}>
                Double-Entry General Ledger Postings
              </h4>
              {selectedTransfer.journalEntries && selectedTransfer.journalEntries.length > 0 ? (
                selectedTransfer.journalEntries.map((je: any) => (
                  <div key={je.id} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary-emerald)' }}>{je.entryNumber}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{je.description}</span>
                    </div>
                    {je.lines?.map((line: any) => (
                      <div key={line.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.2rem 0' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{line.accountName}</span>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <span style={{ color: line.debit > 0 ? '#10b981' : 'transparent', width: '90px', textAlign: 'right' }}>
                            {line.debit > 0 ? `DR: LKR ${line.debit.toLocaleString()}` : ''}
                          </span>
                          <span style={{ color: line.credit > 0 ? '#f59e0b' : 'transparent', width: '90px', textAlign: 'right' }}>
                            {line.credit > 0 ? `CR: LKR ${line.credit.toLocaleString()}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  GL vouchers are posted automatically during dispatch and acceptance.
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setSelectedTransfer(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
