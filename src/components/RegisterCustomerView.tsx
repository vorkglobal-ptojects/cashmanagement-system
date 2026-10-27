'use client';

import React, { useState } from 'react';
import { UserPlus, Save, X, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { AuthSession } from '@/lib/types';

interface RegisterCustomerViewProps {
  currentUser: AuthSession | null;
  branches: any[];
  onSuccess: () => void;
  onCancel: () => void;
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

export default function RegisterCustomerView({
  currentUser,
  branches,
  onSuccess,
  onCancel,
}: RegisterCustomerViewProps) {
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
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Dynamics 365 Command Bar */}
      <div className="d365-card" style={{ padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} color="#0d9488" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Register New Customer
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '0.4rem 0.85rem' }}>
            <X size={14} /> Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="btn-primary"
            style={{ padding: '0.4rem 1rem' }}
          >
            <Save size={14} />
            <span>{loading ? 'Saving...' : 'Save & Register Customer'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '4px',
          padding: '0.65rem 1rem',
          color: '#991b1b',
          fontSize: '0.85rem',
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
          padding: '0.65rem 1rem',
          color: '#166534',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form Fields Grid (Dynamics 365 Field Service style) */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Left Column: Personal Information */}
        <div className="d365-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            1. Customer Legal Details
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
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
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.5rem 0.65rem',
                color: '#0f172a',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
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
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.5rem 0.65rem',
                color: '#0f172a',
              }}
            />
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Duplicate NIC is automatically prevented</span>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
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
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.5rem 0.65rem',
                color: '#0f172a',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
              Registering Branch *
            </label>
            <select
              value={registeringBranchId}
              onChange={(e) => setRegisteringBranchId(e.target.value)}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.5rem 0.65rem',
                color: '#0f172a',
              }}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
              Residential Address *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Street, City, Postal code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.5rem 0.65rem',
                color: '#0f172a',
              }}
            />
          </div>
        </div>

        {/* Right Column: Bank Account Details */}
        <div className="d365-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            2. Customer Bank Account Details (Direct Transfer Target)
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
              Bank Name *
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.5rem 0.65rem',
                color: '#0f172a',
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
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
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
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.5rem 0.65rem',
                color: '#0f172a',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
              Bank Account Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 8001928471"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value.trim())}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.5rem 0.65rem',
                color: '#0f172a',
                fontWeight: 600,
              }}
            />
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Payments will be made directly to this account</span>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
              Account Holder's Name *
            </label>
            <input
              type="text"
              required
              placeholder="Name exactly as registered at the bank"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.5rem 0.65rem',
                color: '#0f172a',
              }}
            />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
            >
              <Save size={16} />
              <span>{loading ? 'Validating...' : 'Register Customer'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
