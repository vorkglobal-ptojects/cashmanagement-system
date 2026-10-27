'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle, Clock, Building2, Upload, AlertCircle, FileText, Check, ExternalLink } from 'lucide-react';
import { AuthSession, FundTransferRequest } from '@/lib/types';

interface PaymentsTransfersViewProps {
  transfers: FundTransferRequest[];
  currentUser: AuthSession | null;
  onSelectTransfer: (transfer: FundTransferRequest) => void;
  onRefresh: () => void;
}

export default function PaymentsTransfersView({
  transfers,
  currentUser,
  onSelectTransfer,
  onRefresh,
}: PaymentsTransfersViewProps) {
  const readyForPayment = transfers.filter((t) => t.status === 'APPROVED_AWAITING_PAYMENT');

  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CEFT' | 'SLIPS' | 'RTGS'>('CEFT');
  const [bankReference, setBankReference] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeTransfer = readyForPayment.find((t) => t.id === activePaymentId);

  const startPayment = (t: FundTransferRequest) => {
    setActivePaymentId(t.id);
    setActualAmount(t.requestedAmount.toString());
    setBankReference(`TXN-${t.fundingBranchId}-${Math.floor(100000 + Math.random() * 900000)}`);
    setReceiptUrl('/logo.png'); // default clean receipt placeholder or uploaded file
    setReceiptFileName('Bank_Transfer_Slip.pdf');
    setError(null);
    setSuccessMsg(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentId) return;

    if (!bankReference.trim()) {
      setError('Bank transaction reference number is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fund-transfers/${activePaymentId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          bankReference: bankReference.trim(),
          actualAmountPaid: parseFloat(actualAmount) || activeTransfer?.requestedAmount,
          receiptUrl: receiptUrl || '/logo.png',
          receiptFileName: receiptFileName || 'Bank_Transfer_Slip.pdf',
          notes: paymentNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record direct bank payment');

      setSuccessMsg('Payment recorded successfully and queued for receipt verification.');
      setActivePaymentId(null);
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
          <CreditCard size={18} color="#0d9488" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Approved Direct-to-Customer Bank Payments
          </h2>
          <span style={{
            fontSize: '0.75rem',
            background: '#e0f2fe',
            color: '#0369a1',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            fontWeight: 600,
          }}>
            {readyForPayment.length} Ready for Transfer
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

      {/* Payment Execution Modal/Drawer if active */}
      {activePaymentId && activeTransfer && (
        <div className="d365-card" style={{ padding: '1.25rem', borderLeft: '4px solid #0d9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Process Bank Transfer • {activeTransfer.requestNumber || activeTransfer.id}
            </h3>
            <button
              onClick={() => setActivePaymentId(null)}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            >
              Close
            </button>
          </div>

          <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Beneficiary Details Box */}
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{activeTransfer.customerName || activeTransfer.customer?.fullName || 'Customer'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Bank:</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{activeTransfer.bankName || activeTransfer.customer?.bankName || 'Bank'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Account Number:</span>
                <div style={{ fontWeight: 700, color: '#0d9488' }}>
                  {activeTransfer.customer?.rawBankAccount || activeTransfer.customer?.bankAccountNumber || '7020019283'}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Amount to Disburse:</span>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                  LKR {activeTransfer.requestedAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Input row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="field-label">Payment Rail *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="field-input"
                  required
                >
                  <option value="CEFT">CEFT (Real-Time Electronic Fund Transfer)</option>
                  <option value="SLIPS">SLIPS (Sri Lanka Interbank Payment)</option>
                  <option value="RTGS">RTGS (High-Value Real Time Settlement)</option>
                </select>
              </div>

              <div>
                <label className="field-label">Bank Transaction Reference *</label>
                <input
                  type="text"
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                  className="field-input"
                  placeholder="e.g. CEFT-88392019"
                  required
                />
              </div>

              <div>
                <label className="field-label">Actual Amount Transferred (LKR) *</label>
                <input
                  type="number"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  className="field-input"
                  required
                />
              </div>

              <div>
                <label className="field-label">Upload Bank Receipt / Advice Slip *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="field-input"
                  style={{ padding: '0.3rem' }}
                />
                {receiptFileName && (
                  <span style={{ fontSize: '0.72rem', color: '#0d9488', marginTop: '0.2rem', display: 'block' }}>
                    Selected: {receiptFileName}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setActivePaymentId(null)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                <Check size={14} /> {loading ? 'Recording...' : 'Record Payment & Upload Receipt'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table */}
      <div className="d365-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="d365-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Customer / Beneficiary</th>
                <th>Bank &amp; Account</th>
                <th>Requesting Branch</th>
                <th>Funding Branch</th>
                <th>Amount (LKR)</th>
                <th>Approved By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {readyForPayment.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No transfers are currently pending payment execution.
                  </td>
                </tr>
              ) : (
                readyForPayment.map((t) => (
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
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.customerName || t.customer?.fullName || 'Valued Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NIC: {t.customerNic || t.customer?.nicNumber || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.bankName || t.customer?.bankName || 'Direct Account'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0d9488', fontFamily: 'monospace' }}>
                        {t.customer?.rawBankAccount || t.customer?.bankAccountNumber || '7020019283'}
                      </div>
                    </td>
                    <td>{t.requestingBranchId}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{t.fundingBranchId}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      LKR {t.requestedAmount.toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem' }}>{t.approvedByName || 'Authorized Approver'}</div>
                    </td>
                    <td>
                      <button
                        onClick={() => startPayment(t)}
                        className="btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Pay &amp; Upload Slip
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
