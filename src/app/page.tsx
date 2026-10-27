'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

import CleanDashboardView from '@/components/CleanDashboardView';
import CustomersView from '@/components/CustomersView';
import RegisterCustomerView from '@/components/RegisterCustomerView';
import NewTransferRequestView from '@/components/NewTransferRequestView';
import ApprovalInboxView from '@/components/ApprovalInboxView';
import PaymentsTransfersView from '@/components/PaymentsTransfersView';
import ReceiptsVerificationView from '@/components/ReceiptsVerificationView';
import TransactionHistoryView from '@/components/TransactionHistoryView';
import ReportsView from '@/components/ReportsView';
import BranchUserManagementView from '@/components/BranchUserManagementView';
import AuditView from '@/components/AuditView';

import TransferDetailsModal from '@/components/TransferDetailsModal';
import CustomerProfileModal from '@/components/CustomerProfileModal';
import RegisterCustomerModal from '@/components/RegisterCustomerModal';

import { AuthSession, Customer, FundTransferRequest } from '@/lib/types';
import { Lock, LogIn, AlertCircle, Building2, UserCheck, Shield } from 'lucide-react';

export default function CashManagementApp() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transfers, setTransfers] = useState<FundTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Global Filter State (controlled from TopBar search and branch selector)
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<FundTransferRequest | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('borella');
  const [loginPassword, setLoginPassword] = useState('borella123@');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Check existing session
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        await loadMasterData();
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const performLogin = async (identifier: string, pass: string) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setCurrentUser(data.user);
      await loadMasterData();
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [branchesRes, customersRes, transfersRes] = await Promise.all([
        fetch('/api/branches'),
        fetch('/api/customers'),
        fetch('/api/fund-transfers'),
      ]);

      if (branchesRes.ok) {
        const data = await branchesRes.json();
        setBranches(data.branches || []);
      }
      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomers(data.customers || []);
      }
      if (transfersRes.ok) {
        const data = await transfersRes.json();
        setTransfers(data.transfers || []);
      }
    } catch (err) {
      console.error('Master data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMasterData();
    }
  }, [currentUser?.userId]);

  const handleRoleSwitch = async (targetUsername: string) => {
    let pass = 'admin123@';
    if (targetUsername === 'manager' || targetUsername.startsWith('manager_')) pass = 'manager123@';
    else if (targetUsername === 'admin' || targetUsername === 'sanjay') pass = 'admin123@';
    else if (targetUsername.startsWith('employee_')) {
      const b = targetUsername.replace('employee_', '');
      pass = `${b}123@`;
    } else {
      pass = `${targetUsername}123@`;
    }
    await performLogin(targetUsername, pass);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  // Badges for sidebar
  const pendingCount = transfers.filter((t) => t.status === 'PENDING_APPROVAL').length;
  const paymentCount = transfers.filter((t) => t.status === 'APPROVED_AWAITING_PAYMENT').length;
  const verifyCount = transfers.filter(
    (t) => t.status === 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION' || t.status === 'VERIFICATION_REQUIRED'
  ).length;

  // 1. Unauthenticated Login Screen (Matching User's Uploaded Design)
  if (!currentUser && !loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: '#85dbb1', // User's mint pastel canvas
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      }}>
        <div style={{
          width: '100%',
          maxWidth: '820px',
          minHeight: '460px',
          borderRadius: '32px',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.14)',
          background: '#ffffff',
        }}>
          {/* Left Side: Pure White with Logo and Title */}
          <div style={{
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}>
            <div style={{
              width: '210px',
              height: '210px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.75rem',
            }}>
              <img
                src="/logo.png"
                alt="Cash Management System Logo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            <h1 style={{
              fontSize: '1.7rem',
              fontWeight: 800,
              color: '#349b74',
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Cash Management<br />System
            </h1>
          </div>

          {/* Right Side: Charcoal Form with Mint Inputs */}
          <div style={{
            background: '#352f31',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '3.5rem 3rem',
          }}>
            {loginError && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1.25rem',
                color: '#991b1b',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}>
                <AlertCircle size={15} />
                <span>{loginError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                performLogin(loginIdentifier, loginPassword);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
            >
              {/* Username */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#b2a8a9',
                  marginBottom: '0.45rem',
                  fontWeight: 500,
                }}>
                  Username :
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    background: '#8fe3b8',
                    color: '#133525',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#b2a8a9',
                  marginBottom: '0.45rem',
                  fontWeight: 500,
                }}>
                  Password :
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    background: '#8fe3b8',
                    color: '#133525',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Choose Role */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#b2a8a9',
                  marginBottom: '0.45rem',
                  fontWeight: 500,
                }}>
                  Choose your role :
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={loginIdentifier}
                    onChange={(e) => {
                      const id = e.target.value;
                      setLoginIdentifier(id);
                      if (id === 'admin' || id === 'sanjay') setLoginPassword('admin123@');
                      else if (id === 'manager') setLoginPassword('manager123@');
                      else setLoginPassword(`${id}123@`);
                    }}
                    style={{
                      width: '100%',
                      background: '#8fe3b8',
                      color: '#133525',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.75rem 2.2rem 0.75rem 1rem',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <optgroup label="Branch Logins (format: branch / branch123@)">
                      <option value="borella">Borella Branch (borella / borella123@)</option>
                      <option value="dehiwela">Dehiwela Branch (dehiwela / dehiwela123@)</option>
                      <option value="dematagoda">Dematagoda Branch (dematagoda / dematagoda123@)</option>
                      <option value="homagama">Homagama Branch (homagama / homagama123@)</option>
                      <option value="kadawatha">Kadawatha Branch (kadawatha / kadawatha123@)</option>
                      <option value="kiribathgoda">Kiribathgoda Branch (kiribathgoda / kiribathgoda123@)</option>
                      <option value="kottawa">Kottawa Branch (kottawa / kottawa123@)</option>
                      <option value="panadura">Panadura Branch (panadura / panadura123@)</option>
                      <option value="w3">W3 Branch (w3 / w3123@)</option>
                      <option value="w4">W4 Branch (w4 / w4123@)</option>
                      <option value="office">Office Branch (office / office123@)</option>
                      <option value="super">Super Branch (super / super123@)</option>
                    </optgroup>
                    <optgroup label="Management & Administration">
                      <option value="manager">Manager (manager / manager123@)</option>
                      <option value="admin">Admin (admin / admin123@)</option>
                    </optgroup>
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#133525',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m8 10 4 4 4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Centered Login Button */}
              <div style={{ textAlign: 'center', marginTop: '0.65rem' }}>
                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{
                    background: '#8fe3b8',
                    color: '#133525',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 2.25rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {loginLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Application Shell (Company Finance Layout)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f4f6f9' }}>
      {/* Left Sidebar with Docked Profile & Branch Controls */}
      <Sidebar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        currentUser={currentUser}
        pendingCount={pendingCount}
        paymentCount={paymentCount}
        verifyCount={verifyCount}
        onRoleSwitch={handleRoleSwitch}
        onLogout={handleLogout}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        branches={branches}
      />

      {/* Main Work Area Canvas */}
      <main style={{
        flex: 1,
        padding: '1.75rem 2.25rem',
        maxWidth: '1600px',
        width: '100%',
        overflowX: 'auto',
        background: '#f4f6f9',
      }}>
          {currentScreen === 'dashboard' && (
            <CleanDashboardView
              branches={branches}
              customers={customers}
              transfers={transfers}
              currentUser={currentUser}
              onNavigate={(screen) => setCurrentScreen(screen)}
              onSelectTransfer={(t) => setSelectedTransfer(t)}
              onRefresh={loadMasterData}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              searchTerm={searchTerm}
            />
          )}

          {currentScreen === 'customers' && (
            <CustomersView
              customers={customers}
              branches={branches}
              currentUser={currentUser}
              onOpenRegisterModal={() => setCurrentScreen('register-customer')}
              onSelectCustomer={(cId) => setSelectedCustomerId(cId)}
              onRefresh={loadMasterData}
            />
          )}

          {currentScreen === 'register-customer' && (
            <RegisterCustomerView
              currentUser={currentUser}
              branches={branches}
              onSuccess={() => {
                loadMasterData();
                setCurrentScreen('customers');
              }}
              onCancel={() => setCurrentScreen('customers')}
            />
          )}

          {currentScreen === 'new-request' && (
            <NewTransferRequestView
              branches={branches}
              customers={customers}
              currentUser={currentUser}
              onSuccess={() => {
                loadMasterData();
                setCurrentScreen('dashboard');
              }}
              onCancel={() => setCurrentScreen('dashboard')}
            />
          )}

          {currentScreen === 'approval-inbox' && (
            <ApprovalInboxView
              transfers={transfers}
              currentUser={currentUser}
              onSelectTransfer={(t) => setSelectedTransfer(t)}
              onRefresh={loadMasterData}
            />
          )}

          {currentScreen === 'payments' && (
            <PaymentsTransfersView
              transfers={transfers}
              currentUser={currentUser}
              onSelectTransfer={(t) => setSelectedTransfer(t)}
              onRefresh={loadMasterData}
            />
          )}

          {currentScreen === 'receipts' && (
            <ReceiptsVerificationView
              transfers={transfers}
              currentUser={currentUser}
              onSelectTransfer={(t) => setSelectedTransfer(t)}
              onRefresh={loadMasterData}
            />
          )}

          {currentScreen === 'history' && (
            <TransactionHistoryView
              transfers={transfers}
              branches={branches}
              currentUser={currentUser}
              onSelectTransfer={(t) => setSelectedTransfer(t)}
            />
          )}

          {currentScreen === 'reports' && (
            <ReportsView
              transfers={transfers}
              branches={branches}
              currentUser={currentUser}
            />
          )}

          {currentScreen === 'management' && (
            <BranchUserManagementView
              branches={branches}
              currentUser={currentUser}
              onRefresh={loadMasterData}
            />
          )}

          {currentScreen === 'audit' && (
            <AuditView
              currentUser={currentUser}
            />
          )}
        </main>

        {/* Modals */}
        <TransferDetailsModal
        isOpen={!!selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
        transfer={selectedTransfer}
        currentUser={currentUser}
        onSuccess={loadMasterData}
      />

      <CustomerProfileModal
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        customerId={selectedCustomerId}
        currentUser={currentUser}
        onSelectTransfer={(t) => setSelectedTransfer(t)}
      />

      <RegisterCustomerModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        currentUser={currentUser}
        branches={branches}
        onSuccess={loadMasterData}
      />
    </div>
  );
}
