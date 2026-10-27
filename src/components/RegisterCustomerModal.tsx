'use client';

import React, { useState } from 'react';
import { X, UserPlus, Building, CreditCard, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { AuthSession } from '@/lib/types';

interface RegisterCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthSession | null;
  branches: any[];
  onSuccess: () => void;
}

const SRI_LANKAN_BANKS = [
  'Commercial Bank of Ceylon',
  'Bank of Ceylon (BOC)',
  "People's Bank",
  'Sampath Bank',
  'Hatton National Bank (HNB)',
  'Seylan Bank',
  'Nations Trust Bank (NTB)',
  'DFCC Bank',
  'National Development Bank (NDB)',
  'Pan Asia Banking Corporation',
  'Union Bank of Colombo',
  'Standard Chartered Bank',
  'HSBC Sri Lanka',
];

export default function RegisterCustomerModal({
  isOpen,
  onClose,
  currentUser,
  branches,
  onSuccess,
}: RegisterCustomerModalProps) {
  const [fullName, setFullName] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankName, setBankName] = useState(SRI_LANKAN_BANKS[0]);
  const [bankBranch, setBankBranch] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [registeringBranchId, setRegisteringBranchId] = useState(currentUser?.branchId || 'BRL');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          nicNumber,
          address,
          phoneNumber,
          bankName,
          bankBranch,
          bankAccountNumber,
          accountHolderName: accountHolderName || fullName,
          registeringBranchId: registeringBranchId || currentUser?.branchId || 'OFFICE',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register customer');
      }

      setSuccessMsg(`Customer successfully registered with ID: ${data.customer.id}`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(7, 13, 24, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0c1427',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        padding: '2rem',
        position: 'relative',
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          }}>
            <UserPlus size={22} color="#34d399" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Register New Customer
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Capture verified legal identity and bank account information for direct disbursements
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
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

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            color: '#34d399',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section: Personal Information */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={14} /> 1. Customer Legal Identity
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K. A. Sampath Wijesinghe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  National Identity Card (NIC) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 198512304567 or 851234567V"
                  value={nicNumber}
                  onChange={(e) => setNicNumber(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +94 77 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  Registering Branch *
                </label>
                <select
                  value={registeringBranchId}
                  onChange={(e) => setRegisteringBranchId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#111827',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                Residential Address *
              </label>
              <textarea
                required
                rows={2}
                placeholder="No, Street, City / Postal code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Section: Bank Account Details */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CreditCard size={14} /> 2. Customer Bank Account Details (Confidential)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  Bank Name *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#111827',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                >
                  {SRI_LANKAN_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  Bank Branch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Borella / Kollupitiya"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  Customer Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8001928471"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.trim())}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.35rem' }}>
                  Account Holder's Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Name as registered with the bank"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.65rem 1.25rem',
                color: '#cbd5e1',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '0.65rem 1.5rem' }}
            >
              <UserPlus size={16} />
              <span>{loading ? 'Validating & Registering...' : 'Register Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
