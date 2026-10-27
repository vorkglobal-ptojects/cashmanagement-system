'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle, ExternalLink, Check, X, FileText, AlertCircle } from 'lucide-react';
import { AuthSession, FundTransferRequest } from '@/lib/types';

interface ReceiptsVerificationViewProps {
  transfers: FundTransferRequest[];
  currentUser: AuthSession | null;
  onSelectTransfer: (transfer: FundTransferRequest) => void;
  onRefresh: () => void;
}

export default function ReceiptsVerificationView({
  transfers,
  currentUser,
  onSelectTransfer,
  onRefresh,
}: ReceiptsVerificationViewProps) {
  const pendingVerification = transfers.filter(
    (t) => t.status === 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION' || t.status === 'VERIFICATION_REQUIRED'
  );

  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [isFlagging, setIsFlagging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeTransfer = pendingVerification.find((t) => t.id === activeReviewId);

  const handleVerify = async (transferId: string, confirmed: boolean) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/fund-transfers/${transferId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmed,
          verificationNotes: confirmed ? 'Bank transfer advice and reference verified' : flagReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify transaction');

      setSuccessMsg(confirmed ? 'Transfer receipt confirmed and marked COMPLETED' : 'Transaction flagged for review');
      setActiveReviewId(null);
      setIsFlagging(false);
      setFlagReason('');
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <ShieldCheck size={18} color="#0d9488" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Receipt Verification Queue
          </h2>
          <span style={{
            fontSize: '0.75rem',
            background: '#f3e8ff',
            color: '#6b21a8',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            fontWeight: 600,
          }}>
            {pendingVerification.length} Pending Verification
          </span>
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

      {/* Review Box */}
      {activeReviewId && activeTransfer && (
        <div className="d365-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Verify Bank Advice • {activeTransfer.requestNumber || activeTransfer.id}
            </h3>
            <button
              onClick={() => {
                setActiveReviewId(null);
                setIsFlagging(false);
              }}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Payment Summary */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <strong style={{ color: '#0f172a', display: 'block' }}>{activeTransfer.customerName || activeTransfer.customer?.fullName || 'Customer'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Bank &amp; Account:</span>
                <strong style={{ color: '#0f172a', display: 'block' }}>
                  {activeTransfer.bankName || activeTransfer.customer?.bankName || 'Bank'} - {activeTransfer.customer?.rawBankAccount || activeTransfer.customer?.bankAccountNumber || '7020019283'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Amount Disbursed:</span>
                <strong style={{ color: '#0d9488', fontSize: '1rem', display: 'block' }}>
                  LKR {(activeTransfer.actualAmountPaid || activeTransfer.requestedAmount).toLocaleString()}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Bank Reference:</span>
                <strong style={{ color: '#0f172a', display: 'block', fontFamily: 'monospace' }}>
                  {activeTransfer.bankReference || 'TXN-REF-PENDING'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Payment Rail:</span>
                <strong style={{ color: '#0f172a', display: 'block' }}>
                  {activeTransfer.paymentMethod || 'CEFT'}
                </strong>
              </div>
            </div>

            {/* Receipt Preview */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                Uploaded Receipt Advice: {activeTransfer.receiptFileName || 'Bank_Receipt.pdf'}
              </div>
              <div style={{
                width: '180px',
                height: '140px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '0.5rem',
              }}>
                <img
                  src={activeTransfer.receiptUrl || '/logo.png'}
                  alt="Receipt Advice"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>

          {isFlagging ? (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="field-label">Discrepancy / Review Reason *</label>
              <input
                type="text"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="field-input"
                placeholder="e.g. Receipt amount does not match bank reference or beneficiary name is truncated"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFlagging(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify(activeTransfer.id, false)}
                  className="btn-danger"
                  disabled={loading || !flagReason.trim()}
                >
                  Confirm Flag
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setIsFlagging(true)}
                className="btn-secondary"
                style={{ color: '#b45309' }}
                disabled={loading}
              >
                <AlertTriangle size={14} /> Flag for Discrepancy
              </button>
              <button
                type="button"
                onClick={() => handleVerify(activeTransfer.id, true)}
                className="btn-primary"
                disabled={loading}
              >
                <Check size={14} /> Confirm &amp; Mark Completed
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Table */}
      <div className="d365-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="d365-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Customer</th>
                <th>Funding Branch</th>
                <th>Amount (LKR)</th>
                <th>Bank Reference</th>
                <th>Payment Rail</th>
                <th>Receipt Slip</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingVerification.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No payments are currently awaiting receipt verification.
                  </td>
                </tr>
              ) : (
                pendingVerification.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <button
                        onClick={() => onSelectTransfer(t)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '0.84rem',
                        }}
                      >
                        {t.requestNumber || t.id}
                      </button>
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.customerName || t.customer?.fullName || 'Customer'}</td>
                    <td>{t.fundingBranchId}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      LKR {(t.actualAmountPaid || t.requestedAmount).toLocaleString()}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#0f172a' }}>
                      {t.bankReference || '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        {t.paymentMethod || 'CEFT'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setActiveReviewId(t.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0d9488',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <FileText size={13} /> {t.receiptFileName || 'View Receipt'}
                      </button>
                    </td>
                    <td>
                      <span className={`status-badge status-${t.status.toLowerCase().replace(/_/g, '-')}`}>
                        {t.status === 'VERIFICATION_REQUIRED' ? 'Flagged Review' : 'Awaiting Check'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setActiveReviewId(t.id)}
                        className="btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Verify Advice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
