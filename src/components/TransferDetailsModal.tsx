'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard, 
  Upload, 
  FileText, 
  AlertTriangle, 
  Eye, 
  Building2, 
  User, 
  ShieldCheck, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { AuthSession, FundTransferRequest } from '@/lib/types';

interface TransferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: FundTransferRequest | null;
  currentUser: AuthSession | null;
  onSuccess: () => void;
}

export default function TransferDetailsModal({
  isOpen,
  onClose,
  transfer,
  currentUser,
  onSuccess,
}: TransferDetailsModalProps) {
  // Approval / Rejection state
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Payment Recording state
  const [actualAmountPaid, setActualAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CEFT' | 'SLIPS' | 'RTGS' | 'INTERNAL_BANK_TRANSFER'>('CEFT');
  const [bankRef, setBankRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptMimeType, setReceiptMimeType] = useState('');

  // Verification state
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showFlagForm, setShowFlagForm] = useState(false);

  // Receipt Preview
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transfer) return null;

  // Role permissions
  const isApprover =
    currentUser?.role === 'MAIN_ADMIN' ||
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'BRANCH_MANAGER';

  const canRecordPayment =
    currentUser?.role === 'MAIN_ADMIN' ||
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'BRANCH_MANAGER' ||
    currentUser?.role === 'BRANCH_EMPLOYEE';

  const isVerifier =
    currentUser?.role === 'MAIN_ADMIN' ||
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'BRANCH_MANAGER';

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
      setError('Please upload an image (JPG, PNG) or PDF document.');
      return;
    }

    setReceiptFileName(file.name);
    setReceiptMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 1. Submit Approval or Rejection
  const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/fund-transfers/${transfer.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          notes: approvalNotes,
          rejectionReason: decision === 'REJECT' ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record decision');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Direct Bank Payment & Upload Receipt
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = actualAmountPaid ? parseFloat(actualAmountPaid) : transfer.requestedAmount;
    if (!receiptDataUrl) {
      setError('Please upload a valid payment receipt or bank transfer confirmation advice.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/fund-transfers/${transfer.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualAmountPaid: amount,
          paymentMethod,
          bankTransactionReference: bankRef,
          paymentNotes,
          receiptUrl: receiptDataUrl,
          receiptFileName,
          receiptMimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify Payment
  const handleVerify = async (action: 'VERIFY' | 'FLAG_FOR_REVIEW') => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/fund-transfers/${transfer.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: verificationNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify transaction');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <span className="badge badge-pending"><Clock size={12} /> Pending Approval</span>;
      case 'APPROVED_AWAITING_PAYMENT':
        return <span className="badge badge-approved"><CheckCircle size={12} /> Approved — Awaiting Payment</span>;
      case 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION':
        return <span className="badge badge-awaiting-verify"><Clock size={12} /> Payment Submitted — Awaiting Verification</span>;
      case 'VERIFICATION_REQUIRED':
        return <span className="badge badge-flagged"><AlertTriangle size={12} /> Verification Required (Flagged)</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed"><ShieldCheck size={12} /> Completed &amp; Verified</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem',
    }}>
      <div className="d365-card" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
        padding: '1.75rem',
        position: 'relative',
        borderRadius: '8px',
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
            color: '#64748b',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {transfer.id}
              </h2>
              {getStatusBadge(transfer.status)}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              Created on {new Date(transfer.requestDate).toLocaleString()} by {transfer.requestingUserName}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Requested Amount</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0d9488', letterSpacing: '-0.02em' }}>
              LKR {transfer.requestedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1rem',
            color: '#991b1b',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Branch Routing & Request Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Requesting Branch</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Building2 size={16} color="#0d9488" />
              {transfer.requestingBranch?.name} ({transfer.requestingBranch?.code})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Funding Branch (Liquidity Source)</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Building2 size={16} color="#0284c7" />
              {transfer.fundingBranch?.name} ({transfer.fundingBranch?.code})
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Reason for Transfer</div>
            <div style={{ fontSize: '0.88rem', color: '#0f172a', marginTop: '0.2rem' }}>{transfer.reason}</div>
            {transfer.additionalNotes && (
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', fontStyle: 'italic' }}>
                Notes: {transfer.additionalNotes}
              </div>
            )}
          </div>
        </div>

        {/* 2. Customer Registered Bank Account Details (Confidential) */}
        <div style={{
          background: '#f0fdfa',
          border: '1px solid #ccfbf1',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <h4 style={{ fontSize: '0.8rem', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
            <CreditCard size={15} /> Direct-to-Customer Bank Details
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Beneficiary Name</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                {transfer.customer?.fullName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                NIC: {transfer.customer?.nicNumber}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Bank Name &amp; Branch</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                {transfer.customer?.bankName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#0d9488' }}>
                Branch: {transfer.customer?.bankBranch}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Bank Account Number</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d9488', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                {transfer.customer?.bankAccountNumber}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Holder: {transfer.customer?.accountHolderName}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Approval Details (if decided) */}
        {transfer.approvalDecision && (
          <div style={{
            background: transfer.approvalDecision === 'APPROVED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: transfer.approvalDecision === 'APPROVED' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: transfer.approvalDecision === 'APPROVED' ? '#34d399' : '#f87171' }}>
                Decision: {transfer.approvalDecision} by {transfer.approvedByUserName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Timestamp: {transfer.approvalDate ? new Date(transfer.approvalDate).toLocaleString() : 'N/A'}
              </div>
              {transfer.rejectionReason && (
                <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '0.25rem' }}>
                  Reason: {transfer.rejectionReason}
                </div>
              )}
              {transfer.approvalNotes && (
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  Notes: {transfer.approvalNotes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Payment & Receipt Information (if paid) */}
        {transfer.actualAmountPaid && (
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
          }}>
            <h4 style={{ fontSize: '0.85rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={16} /> Recorded Direct Bank Payment
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Actual Amount Paid</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                  LKR {transfer.actualAmountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Payment Method &amp; Reference</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  {transfer.paymentMethod}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600 }}>
                  Ref: {transfer.bankTransactionReference}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Paid By &amp; Date</div>
                <div style={{ fontSize: '0.85rem', color: '#fff' }}>{transfer.paidByUserName}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {transfer.paymentDate ? new Date(transfer.paymentDate).toLocaleString() : ''}
                </div>
              </div>
            </div>

            {/* Receipt Preview Attachment */}
            {transfer.receiptUrl && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="#c084fc" />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                      {transfer.receiptFileName || 'payment_receipt.png'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Uploaded on {transfer.receiptUploadedAt ? new Date(transfer.receiptUploadedAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReceiptPreviewOpen(true)}
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#c084fc',
                    borderRadius: '6px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Eye size={14} /> View Receipt Advice
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5. Verification Status (if verified or flagged) */}
        {transfer.verificationStatus && (
          <div style={{
            background: transfer.verificationStatus === 'VERIFIED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
            border: transfer.verificationStatus === 'VERIFIED' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(249, 115, 22, 0.35)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: transfer.verificationStatus === 'VERIFIED' ? '#34d399' : '#fb923c' }}>
              Verification Status: {transfer.verificationStatus} by {transfer.verifiedByUserName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Verified on {transfer.verifiedAt ? new Date(transfer.verifiedAt).toLocaleString() : ''}
            </div>
            {transfer.verificationNotes && (
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                Note: {transfer.verificationNotes}
              </div>
            )}
          </div>
        )}

        {/* ================= ACTIONS WORKFLOW SECTION ================= */}

        {/* Action 1: Pending Approval -> Approve or Reject */}
        {transfer.status === 'PENDING_APPROVAL' && isApprover && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.25rem', marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} /> Approver Action Required
            </h4>

            {showRejectForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#f87171' }}>
                  Please specify the exact reason for rejecting this transfer: *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Incomplete KYC validation or single transaction limit exceeded"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '0.65rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#cbd5e1',
                      borderRadius: '8px',
                      padding: '0.55rem 1rem',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={loading || !rejectionReason.trim()}
                    onClick={() => handleDecision('REJECT')}
                    className="btn-danger"
                  >
                    <XCircle size={16} />
                    <span>Confirm Rejection</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                    Approval Comments / Internal Treasury Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified with Head of Treasury. Direct bank transfer authorized."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.85rem',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDecision('APPROVE')}
                    className="btn-primary"
                  >
                    <CheckCircle size={16} />
                    <span>Authorize &amp; Approve Request</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="btn-secondary"
                    style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action 2: Approved Awaiting Payment -> Record Direct Bank Transfer & Upload Receipt */}
        {(transfer.status === 'APPROVED_AWAITING_PAYMENT' || transfer.status === 'VERIFICATION_REQUIRED') && canRecordPayment && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.25rem', marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={16} /> Record Direct Bank Payment &amp; Upload Receipt
            </h4>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                    Actual Amount Paid (LKR) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder={transfer.requestedAmount.toString()}
                    value={actualAmountPaid || transfer.requestedAmount}
                    onChange={(e) => setActualAmountPaid(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '8px',
                      padding: '0.65rem',
                      color: '#34d399',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#111827',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '0.65rem',
                      color: '#fff',
                    }}
                  >
                    <option value="CEFT">LankaPay CEFT (Real-Time)</option>
                    <option value="SLIPS">SLIPS (Same-Day Clearing)</option>
                    <option value="RTGS">RTGS (High-Value Interbank)</option>
                    <option value="INTERNAL_BANK_TRANSFER">Internal Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                    Bank Transaction Reference *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CEFT-88912304"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '0.65rem',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>

              {/* Upload Receipt */}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  Upload Bank Transfer Receipt Advice (PDF, JPG, PNG) *
                </label>
                <div style={{
                  border: '2px dashed rgba(16, 185, 129, 0.4)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.03)',
                  cursor: 'pointer',
                  position: 'relative',
                }}>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
                    onChange={handleFileUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <Upload size={24} color="#34d399" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                    {receiptFileName ? `Selected: ${receiptFileName}` : 'Click or drag bank confirmation receipt here'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Supports scanned JPG, PNG image or PDF slip
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Upload size={16} />
                  <span>{loading ? 'Submitting Payment...' : 'Submit Payment & Upload Receipt for Verification'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action 3: Payment Submitted -> Verification Action */}
        {(transfer.status === 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION' || transfer.status === 'VERIFICATION_REQUIRED') && isVerifier && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.25rem', marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> Independent Payment Verification
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Confirm that the uploaded bank receipt and payment details match the approved customer bank transfer.
            </p>

            {showFlagForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#fb923c' }}>
                  Specify the discrepancy or reason for flagging this receipt for review: *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Receipt image is unreadable or transaction reference does not match statement"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(249, 115, 22, 0.05)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    borderRadius: '8px',
                    padding: '0.65rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowFlagForm(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#cbd5e1',
                      borderRadius: '8px',
                      padding: '0.55rem 1rem',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={loading || !verificationNotes.trim()}
                    onClick={() => handleVerify('FLAG_FOR_REVIEW')}
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.55rem 1rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>Confirm Flag for Review</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleVerify('VERIFY')}
                  className="btn-primary"
                >
                  <ShieldCheck size={16} />
                  <span>Confirm Receipt &amp; Mark Completed</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFlagForm(true)}
                  style={{
                    background: 'rgba(249, 115, 22, 0.15)',
                    border: '1px solid rgba(249, 115, 22, 0.4)',
                    color: '#fb923c',
                    borderRadius: '8px',
                    padding: '0.625rem 1.25rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>Flag for Review</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Large Receipt Preview Modal */}
      {isReceiptPreviewOpen && transfer.receiptUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ width: '100%', maxWidth: '750px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: 0 }}>
              Payment Advice: {transfer.receiptFileName}
            </h3>
            <button
              onClick={() => setIsReceiptPreviewOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>
          <div style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src={transfer.receiptUrl}
              alt="Payment Receipt Advice"
              style={{ maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
