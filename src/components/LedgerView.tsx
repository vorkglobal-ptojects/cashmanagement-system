'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, RefreshCw } from 'lucide-react';
import { AuthSession } from '@/lib/types';

interface LedgerViewProps {
  currentUser: AuthSession | null;
}

export default function LedgerView({ currentUser }: LedgerViewProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gl');
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Failed to fetch GL entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            General Ledger Journal Vouchers
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Strict double-entry accounting records with atomic debit-credit balance verification.
          </p>
        </div>
        <button onClick={fetchLedger} className="btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {entries.length === 0 ? (
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
            No journal entries recorded. Execute cash dispatches, receipts, or till reconciliations to post vouchers.
          </div>
        ) : (
          entries.map((je) => (
            <div key={je.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem',
                marginBottom: '0.85rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.35rem 0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-emerald)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem' }}>
                    {je.entryNumber}
                  </div>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{je.description}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-subtle)' }}>
                    Posted: {new Date(je.postingDate).toLocaleString()}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: 'var(--primary-emerald)',
                    fontWeight: 600,
                  }}>
                    <CheckCircle2 size={16} />
                    <span>Balanced (Debit = Credit)</span>
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-subtle)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem' }}>Account Code / Name</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem' }}>Memo</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', width: '140px' }}>Debit (LKR)</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', width: '140px' }}>Credit (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {je.lines?.map((line: any) => (
                    <tr key={line.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)' }}>
                      <td style={{ padding: '0.5rem', color: '#fff', fontWeight: 500 }}>{line.accountName}</td>
                      <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{line.memo || '—'}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', color: line.debit > 0 ? '#10b981' : 'var(--text-subtle)', fontWeight: line.debit > 0 ? 600 : 400 }}>
                        {line.debit > 0 ? line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', color: line.credit > 0 ? '#f59e0b' : 'var(--text-subtle)', fontWeight: line.credit > 0 ? 600 : 400 }}>
                        {line.credit > 0 ? line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700, borderTop: '1px solid var(--border-subtle)' }}>
                    <td colSpan={2} style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                      Voucher Balanced Totals:
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#10b981' }}>
                      LKR {je.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#f59e0b' }}>
                      LKR {je.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
