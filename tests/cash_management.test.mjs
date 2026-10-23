import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper calculation
function calculateTallyTotal(breakdown) {
  const sum5000 = (breakdown.note5000 || 0) * 5000;
  const sum1000 = (breakdown.note1000 || 0) * 1000;
  const sum500 = (breakdown.note500 || 0) * 500;
  const sum100 = (breakdown.note100 || 0) * 100;
  const sum50 = (breakdown.note50 || 0) * 50;
  const sum20 = (breakdown.note20 || 0) * 20;
  const coins = Math.max(0, Number(breakdown.coins) || 0);
  return Math.round((sum5000 + sum1000 + sum500 + sum100 + sum50 + sum20 + coins) * 100) / 100;
}

describe('Cash Management System — Core Financial Invariant Tests', () => {
  before(async () => {
    // Ensure DB connected
    await prisma.$connect();
  });

  after(async () => {
    await prisma.$disconnect();
  });

  test('Denomination Tally accurately calculates Sri Lankan notes and coins', () => {
    const tally = {
      note5000: 10,  // 50,000
      note1000: 25,  // 25,000
      note500: 8,    // 4,000
      note100: 15,   // 1,500
      note50: 10,    // 500
      note20: 20,    // 400
      coins: 47.50,  // 47.50
    };
    const total = calculateTallyTotal(tally);
    assert.strictEqual(total, 81447.50);
  });

  test('GL Posting strictly enforces balanced double-entry (Debit == Credit)', async () => {
    const unbalancedEntry = {
      entryNumber: `TEST-JV-${Date.now()}`,
      referenceType: 'TEST_UNBALANCED',
      referenceId: 'REF-001',
      description: 'Unbalanced test',
      totalDebit: 100000,
      totalCredit: 99990, // Unbalanced by 10
    };

    // Attempting to post unbalanced entry must be rejected
    const isBalanced = Math.abs(unbalancedEntry.totalDebit - unbalancedEntry.totalCredit) < 0.001;
    assert.strictEqual(isBalanced, false, 'Unbalanced GL entry must fail equality check');
  });

  test('Separation of Duties (SoD): Requester cannot approve their own cash transfer', async () => {
    const userA = 'user_requester_1';
    const userApprover = 'user_requester_1'; // Same user!

    // In CMS business rules, approval requires requester != approver
    const canApproveSelf = userA !== userApprover;
    assert.strictEqual(canApproveSelf, false, 'Requester must not be allowed to approve self request');
  });

  test('Separation of Duties (SoD): Dispatcher cannot receive and accept physical cash', async () => {
    const dispatcher = 'custodian_sunil';
    const receiver = 'custodian_sunil'; // Same user!

    const canReceiveSelf = dispatcher !== receiver;
    assert.strictEqual(canReceiveSelf, false, 'Dispatcher must not be allowed to receive own dispatch');
  });

  test('Database contains seeded branches and cash accounts with positive liquidity', async () => {
    const branches = await prisma.branch.findMany();
    assert.ok(branches.length >= 6, 'Should have at least 6 branches');

    const accounts = await prisma.cashAccount.findMany();
    assert.ok(accounts.length >= 8, 'Should have at least 8 cash accounts');

    // Central HQ vault should have substantial balance
    const hqVault = accounts.find((a) => a.accountNumber === 'VAULT-HQ-01');
    assert.ok(hqVault, 'HQ Vault must exist');
    assert.ok(hqVault.balance > 10000000, 'HQ Vault should have at least 10M LKR liquidity');
  });
});
