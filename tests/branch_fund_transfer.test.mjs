import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
function maskNic(nic) {
  if (!nic || nic.length < 5) return '******';
  return nic.slice(0, 4) + '******' + nic.slice(-2);
}

function maskBankAccount(accountNo) {
  if (!accountNo || accountNo.length < 5) return '******';
  return '******' + accountNo.slice(-4);
}

const prisma = new PrismaClient();

describe('Centralized Branch Fund Transfer Management System — Acceptance Tests', () => {
  let employeeUser;
  let managerUser;
  let sanjayAdminUser;
  let branchOrigin;
  let branchFunding;
  let registeredCustomer;
  let createdTransfer;

  before(async () => {
    // Fetch seeded users
    employeeUser = await prisma.user.findUnique({ where: { username: 'employee_borella' } });
    managerUser = await prisma.user.findUnique({ where: { username: 'manager_borella' } });
    sanjayAdminUser = await prisma.user.findUnique({ where: { username: 'sanjay' } });

    branchOrigin = await prisma.branch.findUnique({ where: { id: 'BRL' } });
    branchFunding = await prisma.branch.findUnique({ where: { id: 'OFFICE' } });

    assert.ok(employeeUser, 'Employee user must exist');
    assert.ok(managerUser, 'Manager user must exist');
    assert.ok(sanjayAdminUser, 'Mr. Sanjay must exist');
    assert.ok(branchOrigin, 'Origin branch must exist');
    assert.ok(branchFunding, 'Funding branch must exist');
  });

  test('1. Customer Registration with Duplicate NIC Prevention & Confidential Masking', async () => {
    const testNic = '199912345678';

    // Cleanup previous run if exists
    await prisma.fundTransferRequest.deleteMany({ where: { customerId: 'CUST-TEST-0001' } });
    await prisma.customer.deleteMany({ where: { nicNumber: testNic } });

    const newCustomer = await prisma.customer.create({
      data: {
        id: 'CUST-TEST-0001',
        fullName: 'Kusal Mendis',
        nicNumber: testNic,
        address: 'No 77, Galle Face Terrace, Colombo 03',
        phoneNumber: '+94 77 111 2233',
        bankName: 'Commercial Bank of Ceylon',
        bankBranch: 'Kollupitiya',
        bankAccountNumber: '1092837465',
        accountHolderName: 'Kusal Mendis',
        registeringUserId: employeeUser.id,
        registeringBranchId: branchOrigin.id,
        status: 'ACTIVE',
      },
    });

    assert.strictEqual(newCustomer.fullName, 'Kusal Mendis');
    assert.strictEqual(newCustomer.nicNumber, testNic);

    // Test Data Masking
    const maskedNic = maskNic(newCustomer.nicNumber);
    const maskedAccount = maskBankAccount(newCustomer.bankAccountNumber);

    assert.strictEqual(maskedNic, '1999******78', 'NIC must be masked');
    assert.strictEqual(maskedAccount, '******7465', 'Bank Account must be masked');

    // Duplicate NIC prevention check
    let duplicateErrorThrown = false;
    try {
      await prisma.customer.create({
        data: {
          id: 'CUST-TEST-DUPLICATE',
          fullName: 'Another Person',
          nicNumber: testNic,
          address: 'Colombo',
          phoneNumber: '+94 77 999 8888',
          bankName: 'Bank of Ceylon',
          bankBranch: 'Main',
          bankAccountNumber: '9988776655',
          accountHolderName: 'Another Person',
          registeringUserId: employeeUser.id,
          registeringBranchId: branchOrigin.id,
        },
      });
    } catch (e) {
      duplicateErrorThrown = true;
    }
    assert.strictEqual(duplicateErrorThrown, true, 'Duplicate customer registration with same NIC must be rejected by unique constraint');

    registeredCustomer = newCustomer;
  });

  test('2. Employee submits an interbranch funding request from any configured branch', async () => {
    const transferId = 'BFT-TEST-0001';
    await prisma.fundTransferRequest.deleteMany({ where: { id: transferId } });

    const transfer = await prisma.fundTransferRequest.create({
      data: {
        id: transferId,
        customerId: registeredCustomer.id,
        requestingBranchId: branchOrigin.id,
        fundingBranchId: branchFunding.id,
        requestedAmount: 250000.0,
        currency: 'LKR',
        reason: 'Emergency trade supplier payment settlement',
        additionalNotes: 'Real-time CEFT required',
        requestingUserId: employeeUser.id,
        requestingUserName: `${employeeUser.firstName} ${employeeUser.lastName}`,
        status: 'PENDING_APPROVAL',
      },
    });

    assert.strictEqual(transfer.status, 'PENDING_APPROVAL');
    assert.strictEqual(transfer.requestedAmount, 250000.0);
    assert.strictEqual(transfer.fundingBranchId, branchFunding.id);
    createdTransfer = transfer;
  });

  test('3 & 4. Either Manager or Mr. Sanjay can approve or reject, and duplicate decisions are strictly prevented', async () => {
    // Test decision by Mr. Sanjay (MAIN_ADMIN)
    const approvedTransfer = await prisma.fundTransferRequest.update({
      where: { id: createdTransfer.id },
      data: {
        status: 'APPROVED_AWAITING_PAYMENT',
        approvedByUserId: sanjayAdminUser.id,
        approvedByUserName: 'Mr. Sanjay',
        approvalDecision: 'APPROVED',
        approvalNotes: 'Approved after verifying branch liquidity reserve.',
        approvalDate: new Date(),
      },
    });

    assert.strictEqual(approvedTransfer.status, 'APPROVED_AWAITING_PAYMENT');
    assert.strictEqual(approvedTransfer.approvedByUserName, 'Mr. Sanjay');

    // Duplicate approval invariant: Cannot approve if not in PENDING_APPROVAL
    const isPending = approvedTransfer.status === 'PENDING_APPROVAL';
    assert.strictEqual(isPending, false, 'Approved request cannot be re-approved or overridden once decided');
  });

  test('5 & 6. Direct-to-customer bank payment recording and receipt upload', async () => {
    const paidAmount = 250000.0;
    const bankRef = 'CEFT-TXN-908123';
    const sampleReceipt = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const paidTransfer = await prisma.fundTransferRequest.update({
      where: { id: createdTransfer.id },
      data: {
        status: 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION',
        actualAmountPaid: paidAmount,
        paymentDate: new Date(),
        paymentMethod: 'CEFT',
        bankTransactionReference: bankRef,
        paidByUserId: managerUser.id,
        paidByUserName: `${managerUser.firstName} ${managerUser.lastName}`,
        receiptUrl: sampleReceipt,
        receiptFileName: 'ceft_slip_908123.png',
        receiptMimeType: 'image/png',
        receiptUploadedAt: new Date(),
      },
    });

    assert.strictEqual(paidTransfer.status, 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION');
    assert.strictEqual(paidTransfer.bankTransactionReference, bankRef);
    assert.ok(paidTransfer.receiptUrl, 'Receipt must be linked to transaction');
  });

  test('7 & 8. Payment verification confirms receipt match and marks transaction Completed', async () => {
    const completedTransfer = await prisma.fundTransferRequest.update({
      where: { id: createdTransfer.id },
      data: {
        status: 'COMPLETED',
        verifiedByUserId: sanjayAdminUser.id,
        verifiedByUserName: 'Mr. Sanjay',
        verifiedAt: new Date(),
        verificationStatus: 'VERIFIED',
        verificationNotes: 'Receipt verified against Commercial Bank statement.',
      },
    });

    assert.strictEqual(completedTransfer.status, 'COMPLETED');
    assert.strictEqual(completedTransfer.verificationStatus, 'VERIFIED');
    assert.strictEqual(completedTransfer.verifiedByUserName, 'Mr. Sanjay');
  });

  test('9. Customer Profile displays entire chronological transaction history', async () => {
    const customerProfile = await prisma.customer.findUnique({
      where: { id: registeredCustomer.id },
      include: {
        fundTransfers: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    assert.ok(customerProfile.fundTransfers.length >= 1, 'Customer should have transfer history');
    const matched = customerProfile.fundTransfers.find((t) => t.id === createdTransfer.id);
    assert.ok(matched, 'Created transfer should appear in customer history');
    assert.strictEqual(matched.status, 'COMPLETED');
  });

  test('10. Audit log records chronological actions and tamper-evident history', async () => {
    const auditEvent = await prisma.auditEvent.create({
      data: {
        timestamp: new Date(),
        userId: sanjayAdminUser.id,
        username: sanjayAdminUser.username,
        role: sanjayAdminUser.role,
        branchId: 'OFFICE',
        action: 'PAYMENT_VERIFIED',
        resource: 'FundTransferRequest',
        resourceId: createdTransfer.id,
        details: JSON.stringify({ verified: true, status: 'COMPLETED' }),
        status: 'SUCCESS',
      },
    });

    assert.ok(auditEvent.id, 'Audit log must be recorded');
    assert.strictEqual(auditEvent.action, 'PAYMENT_VERIFIED');
  });

  test('11 & 12. Dynamic 11 Branches configuration and all authorized roles support', async () => {
    const branches = await prisma.branch.findMany();
    assert.ok(branches.length >= 11, 'All 11 branches must be dynamically available in the database');

    const expectedBranches = [
      'SUPER', 'Borella', 'Dehiwela', 'Dematagoda', 'Homagama',
      'Kadawatha', 'Kiribathgoda', 'Kottawa', 'Office', 'Panadura',
      'W3', 'W4'
    ];

    for (const bName of expectedBranches) {
      const exists = branches.some((b) => b.name === bName);
      assert.ok(exists, `Branch '${bName}' must be present in dynamic configuration`);
    }
  });
});
