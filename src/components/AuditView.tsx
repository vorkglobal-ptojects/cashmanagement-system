'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
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
            Audit Trail &amp; Regulatory Compliance Ledger
          </h2>
          <span style={{
            fontSize: '0.75rem',
            background: '#f1f5f9',
            color: '#475569',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            fontWeight: 600,
          }}>
            {logs.length} Audit Events
          </span>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="btn-secondary"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Logs
        </button>
      </div>

      {/* Main Table */}
      <div className="d365-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="d365-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Actor &amp; Role</th>
                <th>Resource</th>
                <th>Status</th>
                <th>Details &amp; Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    {loading ? 'Loading audit records...' : 'No audit records recorded yet.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      <span style={{
                        background: '#f1f5f9',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>{log.actorName || log.actorId}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{log.role}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#0284c7' }}>
                      {log.resource}
                    </td>
                    <td>
                      <span className={`status-badge ${log.status === 'SUCCESS' ? 'status-completed' : 'status-rejected'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#475569', maxWidth: '350px' }}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
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
