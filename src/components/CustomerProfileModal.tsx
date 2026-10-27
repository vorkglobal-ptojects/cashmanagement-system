'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  CreditCard, 
  Building, 
  Calendar, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  ArrowRightLeft, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { AuthSession, Customer, FundTransferRequest } from '@/lib/types';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  currentUser: AuthSession | null;
  onSelectTransfer?: (transfer: FundTransferRequest) => void;
}

export default function CustomerProfileModal({
  isOpen,
  onClose,
  customerId,
  currentUser,
  onSelectTransfer,
}: CustomerProfileModalProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [unmasked, setUnmasked] = useState(false);
  const [loading, setLoading] = useState(true);

  const canUnmask =
    currentUser?.role === 'MAIN_ADMIN' ||
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'BRANCH_MANAGER';

  const fetchProfile = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {
      fetchProfile();
      setUnmasked(false);
    }
  }, [isOpen, customerId]);

  if (!isOpen || !customerId) return null;

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
      zIndex: 110,
      padding: '1.5rem',
    }}>
      <div className="d365-card" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
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
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {loading || !customer ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
            Loading customer profile &amp; transaction history...
          </div>
        ) : (
          <div>
            {/* Customer Demographics Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  background: '#f0fdfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #99f6e4',
                }}>
                  <User size={22} color="#0d9488" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {customer.fullName}
                    </h2>
                    <span className="status-badge status-completed">{customer.status}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Customer ID: <strong style={{ color: '#0f172a' }}>{customer.id}</strong> • Registered at {customer.registeringBranch?.name}
                  </div>
                </div>
              </div>

              {/* Mask / Unmask Toggle for Authorized Users */}
              {canUnmask && (
                <button
                  type="button"
                  onClick={() => setUnmasked(!unmasked)}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem' }}
                >
                  {unmasked ? <EyeOff size={14} color="#0d9488" /> : <Eye size={14} />}
                  <span>{unmasked ? 'Mask Confidential Data' : 'Reveal Full NIC & Bank Details'}</span>
                </button>
              )}
            </div>

            {/* Demographics & Bank Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Demographics */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Personal Information
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b', minWidth: '70px' }}>NIC No:</span>
                    <strong style={{ color: '#0f172a', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                      {unmasked && customer.rawNic ? customer.rawNic : customer.nicNumber}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                    <Phone size={14} color="#64748b" />
                    <span>{customer.phoneNumber}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#334155' }}>
                    <MapPin size={14} color="#64748b" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <span>{customer.address}</span>
                  </div>
                </div>
              </div>

              {/* Registered Bank Account */}
              <div style={{
                background: '#f0fdfa',
                border: '1px solid #ccfbf1',
                borderRadius: '6px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.72rem', color: '#0f766e', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Registered Bank Account (Direct Transfer)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Bank &amp; Branch:</span>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {customer.bankName} ({customer.bankBranch})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Account Number:</span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0d9488', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                      {unmasked && customer.rawBankAccount ? customer.rawBankAccount : customer.bankAccountNumber}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Account Holder: <strong style={{ color: '#0f172a' }}>{customer.accountHolderName}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Chronological Transaction History Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ArrowRightLeft size={15} color="#0d9488" />
                  Chronological Transfer History ({customer.fundTransfers?.length || 0})
                </h3>
              </div>

              <div className="d365-card" style={{ overflow: 'hidden' }}>
                <table className="d365-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Date</th>
                      <th>Routing</th>
                      <th>Requested</th>
                      <th>Paid</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!customer.fundTransfers || customer.fundTransfers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
                          No transfer requests recorded for this customer yet.
                        </td>
                      </tr>
                    ) : (
                      customer.fundTransfers.map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 600, color: '#0284c7' }}>
                            {t.id}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            {new Date(t.requestDate).toLocaleDateString()}
                          </td>
                          <td style={{ color: '#334155' }}>
                            {t.requestingBranch?.name} &rarr; <strong>{t.fundingBranch?.name}</strong>
                          </td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            LKR {t.requestedAmount.toLocaleString()}
                          </td>
                          <td style={{ color: t.actualAmountPaid ? '#166534' : '#64748b' }}>
                            {t.actualAmountPaid ? `LKR ${t.actualAmountPaid.toLocaleString()}` : '—'}
                          </td>
                          <td>
                            <span className={`status-badge status-${t.status.toLowerCase().replace(/_/g, '-')}`}>
                              {t.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectTransfer) onSelectTransfer(t);
                                onClose();
                              }}
                              className="btn-secondary"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                            >
                              View
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
        )}
      </div>
    </div>
  );
}
