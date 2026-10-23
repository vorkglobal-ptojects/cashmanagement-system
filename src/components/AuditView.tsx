'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Terminal } from 'lucide-react';
import { AuthSession } from '@/lib/types';

interface AuditViewProps {
  currentUser: AuthSession | null;
}

export default function AuditView({ currentUser }: AuditViewProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit');
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            System Audit Trail & Security Ledger
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Tamper-evident chronological logs of every authentication attempt, state transition, override, and financial movement.
          </p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      <div className="glass-card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem 1rem' }}>Action</th>
              <th style={{ padding: '0.75rem 1rem' }}>Actor & Role</th>
              <th style={{ padding: '0.75rem 1rem' }}>Resource</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Details & Metadata</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
                  No audit log events retrieved.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isSuccess = log.status === 'SUCCESS';
                let parsedDetails = log.details;
                try {
                  parsedDetails = JSON.stringify(JSON.parse(log.details));
                } catch {
                  // Keep as string
                }

                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#fff' }}>
                      <span style={{
                        padding: '0.2rem 0.45rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{log.username || 'System'}</div>
                      <div style={{ color: 'var(--text-subtle)', fontSize: '0.7rem' }}>
                        {log.role || 'System'} {log.branchId ? `(${log.branchId})` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {log.resource} {log.resourceId ? `[${log.resourceId.slice(0, 8)}...]` : ''}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: isSuccess ? 'var(--primary-emerald)' : 'var(--accent-red)',
                      }}>
                        {isSuccess ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <code style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                        {parsedDetails}
                      </code>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
