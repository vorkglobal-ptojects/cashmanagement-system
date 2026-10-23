'use client';

import React from 'react';
import { 
  Building2, 
  ArrowUpRight, 
  Truck, 
  Wallet, 
  Landmark, 
  ShieldAlert, 
  TrendingUp, 
  PlusCircle, 
  RefreshCw 
} from 'lucide-react';
import { AuthSession } from '@/lib/types';

interface DashboardViewProps {
  branches: any[];
  accounts: any[];
  transfers: any[];
  currentUser: AuthSession | null;
  onOpenNewTransfer: () => void;
  onRefresh: () => void;
}

export default function DashboardView({
  branches,
  accounts,
  transfers,
  currentUser,
  onOpenNewTransfer,
  onRefresh,
}: DashboardViewProps) {
  // Calculate Totals
  const vaultCash = accounts
    .filter((a) => a.type === 'VAULT')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const tillCash = accounts
    .filter((a) => a.type === 'TILL')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const bankCash = accounts
    .filter((a) => a.type === 'BANK_ACCOUNT')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const inTransitCash = transfers
    .filter((t) => t.status === 'IN_TRANSIT')
    .reduce((sum, t) => sum + (t.dispatchedAmount || t.approvedAmount || 0), 0);

  const pendingRequestsCount = transfers.filter((t) => t.status === 'REQUESTED').length;
  const discrepanciesCount = transfers.filter((t) => t.status === 'DISCREPANCY_FLAGGED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner & Quick Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            Consolidated Cash Operations
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time physical liquidity across branch vaults, counter tills, in-transit escrows, and commercial bank accounts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onRefresh} className="btn-secondary" title="Refresh Liquidity Positions">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          {currentUser?.role !== 'AUDITOR' && (
            <button onClick={onOpenNewTransfer} className="btn-primary">
              <PlusCircle size={16} />
              <span>Request Cash Movement</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Physical Vault Cash */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
              Branch Vault Cash
            </span>
            <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-emerald)' }}>
              <Building2 size={18} />
            </div>
          </div>
          <div className="amount-lkr" style={{ fontSize: '1.6rem', color: '#fff' }}>
            LKR {vaultCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            Secure holding in 6 branch vaults
          </div>
        </div>

        {/* Counter Till Floats */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
              Counter Till Floats
            </span>
            <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div className="amount-lkr" style={{ fontSize: '1.6rem', color: '#fff' }}>
            LKR {tillCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            Active cashier operational counters
          </div>
        </div>

        {/* Active Cash In-Transit */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
              Cash In-Transit (Escrow)
            </span>
            <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Truck size={18} />
            </div>
          </div>
          <div className="amount-lkr" style={{ fontSize: '1.6rem', color: '#a78bfa' }}>
            LKR {inTransitCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            Armored security transit with waybills
          </div>
        </div>

        {/* Bank Liquidity Reserves */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
              Commercial Bank Accounts
            </span>
            <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>
              <Landmark size={18} />
            </div>
          </div>
          <div className="amount-lkr" style={{ fontSize: '1.6rem', color: '#fff' }}>
            LKR {bankCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            Commercial Bank & Bank of Ceylon
          </div>
        </div>
      </div>

      {/* Operational Attention Alerts */}
      {(pendingRequestsCount > 0 || discrepanciesCount > 0) && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {pendingRequestsCount > 0 && (
            <div style={{
              flex: 1,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-requested">Action Required</span>
                <span style={{ fontSize: '0.875rem', color: '#fff' }}>
                  <strong>{pendingRequestsCount} Cash Request(s)</strong> awaiting Head Office / Manager approval.
                </span>
              </div>
            </div>
          )}

          {discrepanciesCount > 0 && (
            <div style={{
              flex: 1,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-discrepancy">Discrepancy</span>
                <span style={{ fontSize: '0.875rem', color: '#fff' }}>
                  <strong>{discrepanciesCount} Shipment Variance(s)</strong> flagged for audit investigation.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Branch Liquidity & Safe Holding Limits */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>Branch Cash Holdings vs Safe Limits</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Monitors physical cash aggregation against permitted maximum insurance thresholds.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {branches.map((b) => {
            const isNearLimit = b.utilizationPercent >= 80;
            return (
              <div
                key={b.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{b.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>
                      {b.city} ({b.id})
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isNearLimit ? 'var(--accent-red)' : 'var(--primary-emerald)',
                    background: isNearLimit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                  }}>
                    {b.utilizationPercent}% of Limit
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                  <span className="amount-lkr" style={{ fontSize: '1.1rem', color: '#fff' }}>
                    LKR {b.totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Max: LKR {b.cashLimit.toLocaleString()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '9999px',
                  marginTop: '0.65rem',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${b.utilizationPercent}%`,
                    height: '100%',
                    background: isNearLimit
                      ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                      : 'linear-gradient(90deg, #06b6d4, #10b981)',
                    borderRadius: '9999px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
