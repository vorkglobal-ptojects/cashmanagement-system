'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { DenominationBreakdown } from '@/lib/types';
import { calculateTallyTotal, DENOMINATION_VALUES } from '@/lib/tallies';

interface DenominationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  expectedAmount?: number;
  onConfirm: (tally: DenominationBreakdown) => void;
  confirmLabel?: string;
  disabled?: boolean;
}

export default function DenominationModal({
  isOpen,
  onClose,
  title,
  expectedAmount,
  onConfirm,
  confirmLabel = 'Confirm Count',
  disabled = false,
}: DenominationModalProps) {
  const [tally, setTally] = useState<DenominationBreakdown>({
    note5000: 0,
    note1000: 0,
    note500: 0,
    note100: 0,
    note50: 0,
    note20: 0,
    coins: 0,
  });

  const totalCalculated = calculateTallyTotal(tally);
  const difference = expectedAmount !== undefined ? Math.round((totalCalculated - expectedAmount) * 100) / 100 : 0;
  const isMatch = expectedAmount !== undefined ? Math.abs(difference) < 0.01 : true;

  // Auto-fill button for quick testing/demo
  const handleAutoFill = () => {
    if (!expectedAmount || expectedAmount <= 0) return;
    let remaining = expectedAmount;
    const n5000 = Math.floor(remaining / 5000);
    remaining %= 5000;
    const n1000 = Math.floor(remaining / 1000);
    remaining %= 1000;
    const n500 = Math.floor(remaining / 500);
    remaining %= 500;
    const n100 = Math.floor(remaining / 100);
    remaining %= 100;
    const n50 = Math.floor(remaining / 50);
    remaining %= 50;
    const n20 = Math.floor(remaining / 20);
    remaining %= 20;

    setTally({
      note5000: n5000,
      note1000: n1000,
      note500: n500,
      note100: n100,
      note50: n50,
      note20: n20,
      coins: remaining,
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '1.5rem',
        background: '#111827',
        border: '1px solid var(--border-subtle)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Calculator size={20} color="var(--primary-emerald)" />
            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Expected Amount Callout */}
        {expectedAmount !== undefined && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Expected Target</span>
              <span className="amount-lkr" style={{ fontSize: '1.15rem', color: '#fff' }}>
                LKR {expectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Exact Match Tally
            </button>
          </div>
        )}

        {/* Denomination Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
          {(Object.entries(DENOMINATION_VALUES) as [keyof typeof DENOMINATION_VALUES, number][]).map(([key, value]) => {
            const count = tally[key as keyof DenominationBreakdown] as number || 0;
            const subtotal = count * value;
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ width: '90px' }}>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>
                    Rs. {value.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="0"
                    value={count === 0 ? '' : count}
                    placeholder="0"
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setTally((prev) => ({ ...prev, [key]: val }));
                    }}
                    style={{
                      width: '80px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '0.35rem 0.5rem',
                      color: '#fff',
                      textAlign: 'right',
                      fontSize: '0.875rem',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', width: '35px' }}>notes</span>
                </div>
                <div style={{ width: '130px', textAlign: 'right' }}>
                  <span className="amount-lkr" style={{ color: subtotal > 0 ? 'var(--primary-emerald)' : 'var(--text-subtle)', fontSize: '0.875rem' }}>
                    Rs. {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Coins input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.75rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <div style={{ width: '90px' }}>
              <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>Coins</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                step="0.5"
                min="0"
                value={tally.coins === 0 ? '' : tally.coins}
                placeholder="0.00"
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  setTally((prev) => ({ ...prev, coins: val }));
                }}
                style={{
                  width: '80px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '0.35rem 0.5rem',
                  color: '#fff',
                  textAlign: 'right',
                  fontSize: '0.875rem',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', width: '35px' }}>value</span>
            </div>
            <div style={{ width: '130px', textAlign: 'right' }}>
              <span className="amount-lkr" style={{ color: tally.coins > 0 ? 'var(--primary-emerald)' : 'var(--text-subtle)', fontSize: '0.875rem' }}>
                Rs. {(Number(tally.coins) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Total Summary Footer */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600, color: '#fff' }}>Physical Count Total:</span>
            <span className="amount-lkr" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-emerald)' }}>
              LKR {totalCalculated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Variance / Match status indicator */}
          {expectedAmount !== undefined && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              background: isMatch ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${isMatch ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}>
              {isMatch ? (
                <>
                  <CheckCircle2 size={16} color="var(--primary-emerald)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-emerald)', fontWeight: 600 }}>
                    Count matches expected amount exactly.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} color="var(--accent-red)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 600 }}>
                    Variance: {difference > 0 ? `+LKR ${difference.toLocaleString()} (Over)` : `-LKR ${Math.abs(difference).toLocaleString()} (Short)`}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              disabled={disabled || totalCalculated <= 0}
              onClick={() => onConfirm(tally)}
              className="btn-primary"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
