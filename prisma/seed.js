const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const dbPath = path.resolve(__dirname, 'dev.db').replace(/\\/g, '/');
const prisma = new PrismaClient({
  datasources: {
    db: { url: `file:${dbPath}` },
  },
});

async function main() {
  console.log('Seeding Centralized Branch Fund Transfer Management System...');

  // 1. Clean existing records in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.fundTransferRequest.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.glJournalLine.deleteMany();
  await prisma.glJournalEntry.deleteMany();
  await prisma.denominationTally.deleteMany();
  await prisma.cashTransfer.deleteMany();
  await prisma.tillSession.deleteMany();
  await prisma.cashAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.auditEvent.deleteMany();

  // 2. Seed All 11 Branches (+ Office/SUPER as shown in institution dropdown)
  const branches = [
    { id: 'SUPER', name: 'SUPER', code: 'SUPER-01', city: 'Colombo Central', cashLimit: 150000000.0, address: '01 Super Tower, Galle Road, Colombo 03', phone: '+94 11 200 1000' },
    { id: 'BRL', name: 'Borella', code: 'BR-002', city: 'Colombo 08', cashLimit: 15000000.0, address: '124 D.S. Senanayake Mawatha, Borella', phone: '+94 11 268 4001' },
    { id: 'DEH', name: 'Dehiwela', code: 'BR-003', city: 'Dehiwela', cashLimit: 12000000.0, address: '88 Galle Road, Dehiwela', phone: '+94 11 271 2002' },
    { id: 'DEM', name: 'Dematagoda', code: 'BR-004', city: 'Colombo 09', cashLimit: 10000000.0, address: '45 Baseline Road, Dematagoda', phone: '+94 11 269 3003' },
    { id: 'HOM', name: 'Homagama', code: 'BR-005', city: 'Homagama', cashLimit: 10000000.0, address: '32 High Level Road, Homagama', phone: '+94 11 285 4004' },
    { id: 'KAD', name: 'Kadawatha', code: 'BR-006', city: 'Kadawatha', cashLimit: 12000000.0, address: '14 Kandy Road, Kadawatha', phone: '+94 11 292 5005' },
    { id: 'KIR', name: 'Kiribathgoda', code: 'BR-007', city: 'Kiribathgoda', cashLimit: 12000000.0, address: '78 Kandy Road, Kiribathgoda', phone: '+94 11 291 6006' },
    { id: 'KOT', name: 'Kottawa', code: 'BR-008', city: 'Kottawa', cashLimit: 10000000.0, address: '55 High Level Road, Kottawa', phone: '+94 11 278 7007' },
    { id: 'OFFICE', name: 'Office', code: 'HQ-001', city: 'Colombo 03', cashLimit: 200000000.0, address: '100 Corporate Plaza, R.A. De Mel Mawatha, Colombo 03', phone: '+94 11 250 8008' },
    { id: 'PAN', name: 'Panadura', code: 'BR-009', city: 'Panadura', cashLimit: 12000000.0, address: '190 Main Street, Panadura', phone: '+94 38 223 9009' },
    { id: 'W3', name: 'W3', code: 'BR-010', city: 'Colombo West 03', cashLimit: 10000000.0, address: '22 Marine Drive, Colombo 03', phone: '+94 11 243 1010' },
    { id: 'W4', name: 'W4', code: 'BR-011', city: 'Colombo West 04', cashLimit: 10000000.0, address: '44 Station Road, Colombo 04', phone: '+94 11 258 2011' },
  ];

  for (const b of branches) {
    await prisma.branch.create({ data: b });
  }
  console.log(`Seeded ${branches.length} branches.`);

  // 3. Seed Users across roles with intuitive logins:
  // Branch logins: <branchname> / <branchname>123@
  // Manager login: manager / manager123@
  // Admin login: admin / admin123@ (and sanjay / admin123@)
  const users = [
    // --- MAIN ADMINISTRATOR & SYSTEM ADMIN ---
    {
      username: 'admin',
      email: 'admin@company.lk',
      firstName: 'Admin',
      lastName: 'User',
      role: 'MAIN_ADMIN',
      branchId: 'OFFICE',
      passwordHash: await bcrypt.hash('admin123@', 10),
      phone: '+94 77 000 0001',
    },
    {
      username: 'sanjay',
      email: 'sanjay@company.lk',
      firstName: 'Sanjay',
      lastName: 'Sharma',
      role: 'MAIN_ADMIN',
      branchId: 'OFFICE',
      passwordHash: await bcrypt.hash('admin123@', 10),
      phone: '+94 77 123 4567',
    },

    // --- GENERAL MANAGER ---
    {
      username: 'manager',
      email: 'manager@company.lk',
      firstName: 'General',
      lastName: 'Manager',
      role: 'BRANCH_MANAGER',
      branchId: 'OFFICE',
      passwordHash: await bcrypt.hash('manager123@', 10),
      phone: '+94 77 345 6789',
    },

    // --- DIRECT BRANCH LOGINS (username = branch, password = branch123@) ---
    {
      username: 'borella',
      email: 'borella@company.lk',
      firstName: 'Borella',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'BRL',
      passwordHash: await bcrypt.hash('borella123@', 10),
      phone: '+94 77 678 9012',
    },
    {
      username: 'dehiwela',
      email: 'dehiwela@company.lk',
      firstName: 'Dehiwela',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'DEH',
      passwordHash: await bcrypt.hash('dehiwela123@', 10),
      phone: '+94 77 789 0123',
    },
    {
      username: 'dematagoda',
      email: 'dematagoda@company.lk',
      firstName: 'Dematagoda',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'DEM',
      passwordHash: await bcrypt.hash('dematagoda123@', 10),
      phone: '+94 77 123 0004',
    },
    {
      username: 'homagama',
      email: 'homagama@company.lk',
      firstName: 'Homagama',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'HOM',
      passwordHash: await bcrypt.hash('homagama123@', 10),
      phone: '+94 77 890 1234',
    },
    {
      username: 'kadawatha',
      email: 'kadawatha@company.lk',
      firstName: 'Kadawatha',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'KAD',
      passwordHash: await bcrypt.hash('kadawatha123@', 10),
      phone: '+94 77 123 0006',
    },
    {
      username: 'kiribathgoda',
      email: 'kiribathgoda@company.lk',
      firstName: 'Kiribathgoda',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'KIR',
      passwordHash: await bcrypt.hash('kiribathgoda123@', 10),
      phone: '+94 77 123 0007',
    },
    {
      username: 'kottawa',
      email: 'kottawa@company.lk',
      firstName: 'Kottawa',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'KOT',
      passwordHash: await bcrypt.hash('kottawa123@', 10),
      phone: '+94 77 123 0008',
    },
    {
      username: 'office',
      email: 'office@company.lk',
      firstName: 'Office',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'OFFICE',
      passwordHash: await bcrypt.hash('office123@', 10),
      phone: '+94 77 123 0001',
    },
    {
      username: 'panadura',
      email: 'panadura@company.lk',
      firstName: 'Panadura',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'PAN',
      passwordHash: await bcrypt.hash('panadura123@', 10),
      phone: '+94 77 901 2345',
    },
    {
      username: 'w3',
      email: 'w3@company.lk',
      firstName: 'W3',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'W3',
      passwordHash: await bcrypt.hash('w3123@', 10),
      phone: '+94 77 123 0010',
    },
    {
      username: 'w4',
      email: 'w4@company.lk',
      firstName: 'W4',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'W4',
      passwordHash: await bcrypt.hash('w4123@', 10),
      phone: '+94 77 123 0011',
    },
    {
      username: 'super',
      email: 'super@company.lk',
      firstName: 'Super',
      lastName: 'Branch',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'SUPER',
      passwordHash: await bcrypt.hash('super123@', 10),
      phone: '+94 77 123 0012',
    },

    // --- TEST & ROLE ALIASES (preserved for tests) ---
    {
      username: 'employee_borella',
      email: 'emp.borella@company.lk',
      firstName: 'Kavindi',
      lastName: 'Silva',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'BRL',
      passwordHash: await bcrypt.hash('borella123@', 10),
      phone: '+94 77 678 9012',
    },
    {
      username: 'employee_dehiwela',
      email: 'emp.dehiwela@company.lk',
      firstName: 'Niroshan',
      lastName: 'Bandara',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'DEH',
      passwordHash: await bcrypt.hash('dehiwela123@', 10),
      phone: '+94 77 789 0123',
    },
    {
      username: 'employee_homagama',
      email: 'emp.homagama@company.lk',
      firstName: 'Saman',
      lastName: 'Kumara',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'HOM',
      passwordHash: await bcrypt.hash('homagama123@', 10),
      phone: '+94 77 890 1234',
    },
    {
      username: 'employee_panadura',
      email: 'emp.panadura@company.lk',
      firstName: 'Dilani',
      lastName: 'Rodrigo',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'PAN',
      passwordHash: await bcrypt.hash('panadura123@', 10),
      phone: '+94 77 901 2345',
    },
    {
      username: 'manager_borella',
      email: 'mgr.borella@company.lk',
      firstName: 'Dhammika',
      lastName: 'Senanayake',
      role: 'BRANCH_MANAGER',
      branchId: 'BRL',
      passwordHash: await bcrypt.hash('manager123@', 10),
      phone: '+94 77 234 5678',
    },
    {
      username: 'manager_office',
      email: 'mgr.office@company.lk',
      firstName: 'Chamari',
      lastName: 'Wickramasinghe',
      role: 'BRANCH_MANAGER',
      branchId: 'OFFICE',
      passwordHash: await bcrypt.hash('manager123@', 10),
      phone: '+94 77 345 6789',
    },
    {
      username: 'manager_super',
      email: 'mgr.super@company.lk',
      firstName: 'Sunil',
      lastName: 'Fernandopulle',
      role: 'BRANCH_MANAGER',
      branchId: 'SUPER',
      passwordHash: await bcrypt.hash('manager123@', 10),
      phone: '+94 77 456 7890',
    },
    {
      username: 'manager_dehiwela',
      email: 'mgr.dehiwela@company.lk',
      firstName: 'Ruwan',
      lastName: 'Jayawardena',
      role: 'BRANCH_MANAGER',
      branchId: 'DEH',
      passwordHash: await bcrypt.hash('manager123@', 10),
      phone: '+94 77 567 8901',
    },
  ];

  const createdUsers = {};
  for (const u of users) {
    const created = await prisma.user.create({ data: u });
    createdUsers[u.username] = created;
  }
  console.log(`Seeded ${users.length} users.`);

  // 3.5 Seed Cash Accounts (Vaults, Tills, Central Bank Accounts)
  const cashAccounts = [
    { accountNumber: 'VAULT-HQ-01', name: 'Head Office Central Vault', type: 'VAULT', branchId: 'OFFICE', currency: 'LKR', balance: 50000000.0, maxLimit: 100000000.0, status: 'ACTIVE' },
    { accountNumber: 'VAULT-SUPER-01', name: 'Super Branch Regional Vault', type: 'VAULT', branchId: 'SUPER', currency: 'LKR', balance: 35000000.0, maxLimit: 60000000.0, status: 'ACTIVE' },
    { accountNumber: 'VAULT-BRL-01', name: 'Borella Main Vault', type: 'VAULT', branchId: 'BRL', currency: 'LKR', balance: 5500000.0, maxLimit: 8000000.0, status: 'ACTIVE' },
    { accountNumber: 'TILL-BRL-01', name: 'Borella Counter Till 01', type: 'TILL', branchId: 'BRL', currency: 'LKR', balance: 450000.0, maxLimit: 1000000.0, status: 'ACTIVE' },
    { accountNumber: 'VAULT-DEH-01', name: 'Dehiwela Main Vault', type: 'VAULT', branchId: 'DEH', currency: 'LKR', balance: 4800000.0, maxLimit: 7500000.0, status: 'ACTIVE' },
    { accountNumber: 'TILL-DEH-01', name: 'Dehiwela Counter Till 01', type: 'TILL', branchId: 'DEH', currency: 'LKR', balance: 380000.0, maxLimit: 1000000.0, status: 'ACTIVE' },
    { accountNumber: 'VAULT-DEM-01', name: 'Dematagoda Main Vault', type: 'VAULT', branchId: 'DEM', currency: 'LKR', balance: 4200000.0, maxLimit: 6000000.0, status: 'ACTIVE' },
    { accountNumber: 'VAULT-HOM-01', name: 'Homagama Main Vault', type: 'VAULT', branchId: 'HOM', currency: 'LKR', balance: 3900000.0, maxLimit: 6000000.0, status: 'ACTIVE' },
    { accountNumber: 'BANK-BOC-01', name: 'Bank of Ceylon Corporate Treasury', type: 'BANK_ACCOUNT', branchId: 'OFFICE', currency: 'LKR', balance: 120000000.0, bankName: 'Bank of Ceylon', bankAccountNo: '7020019283', status: 'ACTIVE' },
    { accountNumber: 'BANK-COMBANK-01', name: 'Commercial Bank Corporate Account', type: 'BANK_ACCOUNT', branchId: 'OFFICE', currency: 'LKR', balance: 150000000.0, bankName: 'Commercial Bank of Ceylon', bankAccountNo: '8001928471', status: 'ACTIVE' },
    { accountNumber: 'IN-TRANSIT-GLOBAL', name: 'Consolidated Cash In-Transit', type: 'IN_TRANSIT', branchId: null, currency: 'LKR', balance: 0.0, status: 'ACTIVE' },
  ];

  for (const acc of cashAccounts) {
    await prisma.cashAccount.create({ data: acc });
  }
  console.log(`Seeded ${cashAccounts.length} cash accounts.`);

  // 4. Seed Registered Customers
  const customers = [
    {
      id: 'CUST-2026-0001',
      fullName: 'Sampath Wijesinghe',
      nicNumber: '198512304567',
      address: 'No 45/2, Temple Road, Borella, Colombo 08',
      phoneNumber: '+94 71 456 7890',
      bankName: 'Commercial Bank of Ceylon',
      bankBranch: 'Borella',
      bankAccountNumber: '8001928471',
      accountHolderName: 'K. A. Sampath Wijesinghe',
      registeringUserId: createdUsers['employee_borella'].id,
      registeringBranchId: 'BRL',
      status: 'ACTIVE',
    },
    {
      id: 'CUST-2026-0002',
      fullName: 'Dilhani Jayawardena',
      nicNumber: '199267801234',
      address: 'No 18, Station Lane, Dehiwela',
      phoneNumber: '+94 77 345 6781',
      bankName: 'Bank of Ceylon',
      bankBranch: 'Dehiwela',
      bankAccountNumber: '7020019283',
      accountHolderName: 'M. Dilhani Jayawardena',
      registeringUserId: createdUsers['employee_dehiwela'].id,
      registeringBranchId: 'DEH',
      status: 'ACTIVE',
    },
    {
      id: 'CUST-2026-0003',
      fullName: 'Mohammed Rizwan',
      nicNumber: '198034509876',
      address: 'No 102/B, Baseline Road, Dematagoda',
      phoneNumber: '+94 76 890 1234',
      bankName: 'Hatton National Bank',
      bankBranch: 'Dematagoda',
      bankAccountNumber: '003010482910',
      accountHolderName: 'Mohammed Rizwan',
      registeringUserId: createdUsers['employee_borella'].id,
      registeringBranchId: 'DEM',
      status: 'ACTIVE',
    },
    {
      id: 'CUST-2026-0004',
      fullName: 'Kasun Fernando',
      nicNumber: '199518204921',
      address: 'No 74, Katuwawala, Homagama',
      phoneNumber: '+94 72 234 5678',
      bankName: 'Sampath Bank',
      bankBranch: 'Homagama',
      bankAccountNumber: '101293847291',
      accountHolderName: 'P. Kasun Fernando',
      registeringUserId: createdUsers['employee_homagama'].id,
      registeringBranchId: 'HOM',
      status: 'ACTIVE',
    },
    {
      id: 'CUST-2026-0005',
      fullName: 'Tharushi Perera',
      nicNumber: '199856702319',
      address: 'No 12, Beach Road, Panadura',
      phoneNumber: '+94 78 567 8901',
      bankName: "People's Bank",
      bankBranch: 'Panadura',
      bankAccountNumber: '089200192837',
      accountHolderName: 'S. Tharushi Perera',
      registeringUserId: createdUsers['employee_panadura'].id,
      registeringBranchId: 'PAN',
      status: 'ACTIVE',
    },
  ];

  for (const c of customers) {
    await prisma.customer.create({ data: c });
  }
  console.log(`Seeded ${customers.length} customers.`);

  // Sample receipt data URI (SVG/PNG graphic as Data URL for instant preview demonstration)
  const sampleReceiptDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23f8fafc"/><rect x="20" y="20" width="560" height="360" rx="12" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><text x="40" y="70" font-family="sans-serif" font-size="20" font-weight="bold" fill="%230f172a">COMMERCIAL BANK CEFT ADVICE</text><text x="40" y="100" font-family="sans-serif" font-size="14" fill="%2364748b">Electronic Transfer Confirmation Receipt</text><line x1="40" y1="120" x2="560" y2="120" stroke="%23e2e8f0" stroke-width="2"/><text x="40" y="160" font-family="sans-serif" font-size="14" fill="%23475569">Reference No: <tspan font-weight="bold" fill="%230f172a">CEFT-78291048</tspan></text><text x="40" y="195" font-family="sans-serif" font-size="14" fill="%23475569">Beneficiary: <tspan font-weight="bold" fill="%230f172a">Mohammed Rizwan</tspan></text><text x="40" y="230" font-family="sans-serif" font-size="14" fill="%23475569">Bank &amp; Account: <tspan font-weight="bold" fill="%230f172a">Hatton National Bank (003010482910)</tspan></text><text x="40" y="265" font-family="sans-serif" font-size="14" fill="%23475569">Amount: <tspan font-weight="bold" fill="%2316a34a" font-size="18">LKR 220,000.00</tspan></text><text x="40" y="300" font-family="sans-serif" font-size="14" fill="%23475569">Status: <tspan font-weight="bold" fill="%232563eb">SETTLED VIA LANKAPAY</tspan></text><text x="40" y="340" font-family="sans-serif" font-size="12" fill="%2394a3b8">Timestamp: 2026-10-25 14:32:10 LKST</text></svg>';

  // 5. Seed Interbranch Fund Transfer Requests demonstrating all 8 statuses
  const requests = [
    // 1. Pending Approval
    {
      id: 'BFT-2026-0001',
      customerId: 'CUST-2026-0001',
      requestingBranchId: 'BRL',
      fundingBranchId: 'OFFICE',
      requestedAmount: 350000.0,
      currency: 'LKR',
      reason: 'Urgent customer disbursement for commercial vendor supply settlement',
      additionalNotes: 'Customer requested immediate account transfer before 2:00 PM cutoff',
      requestDate: new Date(Date.now() - 3600000 * 4), // 4 hours ago
      requestingUserId: createdUsers['employee_borella'].id,
      requestingUserName: 'Kavindi Silva',
      status: 'PENDING_APPROVAL',
    },
    // 2. Approved — Awaiting Payment
    {
      id: 'BFT-2026-0002',
      customerId: 'CUST-2026-0002',
      requestingBranchId: 'DEH',
      fundingBranchId: 'SUPER',
      requestedAmount: 500000.0,
      currency: 'LKR',
      reason: 'Direct customer credit facility payout',
      additionalNotes: 'Approved under Credit Memo Ref CM-2026/89',
      requestDate: new Date(Date.now() - 3600000 * 24), // 1 day ago
      requestingUserId: createdUsers['employee_dehiwela'].id,
      requestingUserName: 'Niroshan Bandara',
      status: 'APPROVED_AWAITING_PAYMENT',
      approvedByUserId: createdUsers['sanjay'].id,
      approvedByUserName: 'Mr. Sanjay',
      approvalDecision: 'APPROVED',
      approvalNotes: 'Verified with Head of Treasury. Direct bank transfer authorized.',
      approvalDate: new Date(Date.now() - 3600000 * 18),
    },
    // 3. Payment Submitted — Awaiting Verification
    {
      id: 'BFT-2026-0003',
      customerId: 'CUST-2026-0003',
      requestingBranchId: 'DEM',
      fundingBranchId: 'KAD',
      requestedAmount: 220000.0,
      currency: 'LKR',
      reason: 'Customer advance refund settlement',
      additionalNotes: 'Direct bank payment dispatched via LankaPay CEFT',
      requestDate: new Date(Date.now() - 3600000 * 48), // 2 days ago
      requestingUserId: createdUsers['employee_borella'].id,
      requestingUserName: 'Kavindi Silva',
      status: 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION',
      approvedByUserId: createdUsers['manager_borella'].id,
      approvedByUserName: 'Dhammika Senanayake',
      approvalDecision: 'APPROVED',
      approvalNotes: 'Approved for Kadawatha branch funding.',
      approvalDate: new Date(Date.now() - 3600000 * 36),
      actualAmountPaid: 220000.0,
      paymentDate: new Date(Date.now() - 3600000 * 12),
      paymentMethod: 'CEFT',
      bankTransactionReference: 'CEFT-78291048',
      paidByUserId: createdUsers['manager_office'].id,
      paidByUserName: 'Chamari Wickramasinghe',
      paymentNotes: 'Transferred via corporate online banking portal.',
      receiptUrl: sampleReceiptDataUrl,
      receiptFileName: 'ceft_advice_78291048.png',
      receiptMimeType: 'image/png',
      receiptUploadedAt: new Date(Date.now() - 3600000 * 11),
      receiptUploadedByUserId: createdUsers['manager_office'].id,
      receiptUploadedByUserName: 'Chamari Wickramasinghe',
    },
    // 4. Completed
    {
      id: 'BFT-2026-0004',
      customerId: 'CUST-2026-0004',
      requestingBranchId: 'HOM',
      fundingBranchId: 'KIR',
      requestedAmount: 180000.0,
      currency: 'LKR',
      reason: 'Customer contract installment payout',
      additionalNotes: 'Full audit verification complete',
      requestDate: new Date(Date.now() - 3600000 * 72), // 3 days ago
      requestingUserId: createdUsers['employee_homagama'].id,
      requestingUserName: 'Saman Kumara',
      status: 'COMPLETED',
      approvedByUserId: createdUsers['sanjay'].id,
      approvedByUserName: 'Mr. Sanjay',
      approvalDecision: 'APPROVED',
      approvalNotes: 'Approved as requested.',
      approvalDate: new Date(Date.now() - 3600000 * 60),
      actualAmountPaid: 180000.0,
      paymentDate: new Date(Date.now() - 3600000 * 48),
      paymentMethod: 'SLIPS',
      bankTransactionReference: 'SLIPS-99018241',
      paidByUserId: createdUsers['manager_super'].id,
      paidByUserName: 'Sunil Fernandopulle',
      paymentNotes: 'Bank confirmation receipt attached.',
      receiptUrl: sampleReceiptDataUrl,
      receiptFileName: 'slips_confirmation_99018241.png',
      receiptMimeType: 'image/png',
      receiptUploadedAt: new Date(Date.now() - 3600000 * 47),
      receiptUploadedByUserId: createdUsers['manager_super'].id,
      receiptUploadedByUserName: 'Sunil Fernandopulle',
      verifiedByUserId: createdUsers['sanjay'].id,
      verifiedByUserName: 'Mr. Sanjay',
      verifiedAt: new Date(Date.now() - 3600000 * 20),
      verificationStatus: 'VERIFIED',
      verificationNotes: 'Receipt verified against Commercial Bank daily statement. Matched perfectly.',
    },
    // 5. Rejected
    {
      id: 'BFT-2026-0005',
      customerId: 'CUST-2026-0005',
      requestingBranchId: 'PAN',
      fundingBranchId: 'W3',
      requestedAmount: 1200000.0,
      currency: 'LKR',
      reason: 'High-value customer emergency disbursement',
      additionalNotes: 'Requires Board Credit Sub-Committee signoff before funding',
      requestDate: new Date(Date.now() - 3600000 * 96), // 4 days ago
      requestingUserId: createdUsers['employee_panadura'].id,
      requestingUserName: 'Dilani Rodrigo',
      status: 'REJECTED',
      approvedByUserId: createdUsers['sanjay'].id,
      approvedByUserName: 'Mr. Sanjay',
      approvalDecision: 'REJECTED',
      approvalNotes: 'Exceeds branch single transaction threshold (LKR 1,000,000) without prior KYC credit committee escalation.',
      approvalDate: new Date(Date.now() - 3600000 * 90),
      rejectionReason: 'Exceeds branch single transaction threshold without prior credit committee clearance.',
    },
    // 6. Verification Required
    {
      id: 'BFT-2026-0006',
      customerId: 'CUST-2026-0001',
      requestingBranchId: 'W4',
      fundingBranchId: 'OFFICE',
      requestedAmount: 400000.0,
      currency: 'LKR',
      reason: 'Urgent supplier invoice payment',
      additionalNotes: 'Flagged: Payment advice reference does not match statement amount',
      requestDate: new Date(Date.now() - 3600000 * 30),
      requestingUserId: createdUsers['employee_borella'].id,
      requestingUserName: 'Kavindi Silva',
      status: 'VERIFICATION_REQUIRED',
      approvedByUserId: createdUsers['manager_borella'].id,
      approvedByUserName: 'Dhammika Senanayake',
      approvalDecision: 'APPROVED',
      approvalNotes: 'Approved.',
      approvalDate: new Date(Date.now() - 3600000 * 25),
      actualAmountPaid: 400000.0,
      paymentDate: new Date(Date.now() - 3600000 * 15),
      paymentMethod: 'RTGS',
      bankTransactionReference: 'RTGS-0029183',
      paidByUserId: createdUsers['manager_office'].id,
      paidByUserName: 'Chamari Wickramasinghe',
      receiptUrl: sampleReceiptDataUrl,
      receiptFileName: 'rtgs_copy.png',
      receiptMimeType: 'image/png',
      receiptUploadedAt: new Date(Date.now() - 3600000 * 14),
      receiptUploadedByUserId: createdUsers['manager_office'].id,
      receiptUploadedByUserName: 'Chamari Wickramasinghe',
      verifiedByUserId: createdUsers['sanjay'].id,
      verifiedByUserName: 'Mr. Sanjay',
      verifiedAt: new Date(Date.now() - 3600000 * 5),
      verificationStatus: 'FLAGGED_FOR_REVIEW',
      verificationNotes: 'Uploaded receipt shows unclear transaction reference number. Please re-upload high-resolution bank slip.',
    },
  ];

  for (const r of requests) {
    await prisma.fundTransferRequest.create({ data: r });
  }
  console.log(`Seeded ${requests.length} fund transfer requests.`);

  // 6. Seed In-App Notifications
  const notifications = [
    {
      recipientRole: 'MAIN_ADMIN',
      title: 'New Funding Request BFT-2026-0001',
      message: 'Borella branch requested LKR 350,000.00 from Office for customer Sampath Wijesinghe.',
      link: '/transfers?id=BFT-2026-0001',
      type: 'REQUEST_SUBMITTED',
      isRead: false,
    },
    {
      recipientRole: 'BRANCH_MANAGER',
      recipientBranchId: 'OFFICE',
      title: 'New Funding Request BFT-2026-0001',
      message: 'Borella branch requested LKR 350,000.00 from your branch.',
      link: '/transfers?id=BFT-2026-0001',
      type: 'REQUEST_SUBMITTED',
      isRead: false,
    },
    {
      recipientRole: 'MAIN_ADMIN',
      title: 'Payment Awaiting Verification BFT-2026-0003',
      message: 'Chamari Wickramasinghe recorded CEFT payment and uploaded receipt for LKR 220,000.00.',
      link: '/transfers?id=BFT-2026-0003',
      type: 'PAYMENT_SUBMITTED',
      isRead: false,
    },
    {
      recipientRole: 'MAIN_ADMIN',
      title: 'Verification Flagged on BFT-2026-0006',
      message: 'Transaction flagged for review: uploaded receipt requires re-upload.',
      link: '/transfers?id=BFT-2026-0006',
      type: 'VERIFICATION_FLAGGED',
      isRead: true,
    },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }
  console.log(`Seeded ${notifications.length} notifications.`);

  // 7. Seed Audit Events
  const auditLogs = [
    {
      timestamp: new Date(Date.now() - 3600000 * 75),
      userId: createdUsers['employee_homagama'].id,
      username: 'employee_homagama',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'HOM',
      action: 'CUSTOMER_REGISTERED',
      resource: 'Customer',
      resourceId: 'CUST-2026-0004',
      details: JSON.stringify({ fullName: 'Kasun Fernando', nic: '199518204921', bank: 'Sampath Bank' }),
      status: 'SUCCESS',
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 72),
      userId: createdUsers['employee_homagama'].id,
      username: 'employee_homagama',
      role: 'BRANCH_EMPLOYEE',
      branchId: 'HOM',
      action: 'TRANSFER_REQUESTED',
      resource: 'FundTransferRequest',
      resourceId: 'BFT-2026-0004',
      details: JSON.stringify({ customer: 'Kasun Fernando', amount: 180000, fundingBranch: 'KIR' }),
      status: 'SUCCESS',
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 60),
      userId: createdUsers['sanjay'].id,
      username: 'sanjay',
      role: 'MAIN_ADMIN',
      branchId: 'OFFICE',
      action: 'TRANSFER_APPROVED',
      resource: 'FundTransferRequest',
      resourceId: 'BFT-2026-0004',
      details: JSON.stringify({ decision: 'APPROVED', amount: 180000 }),
      status: 'SUCCESS',
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 48),
      userId: createdUsers['manager_super'].id,
      username: 'manager_super',
      role: 'BRANCH_MANAGER',
      branchId: 'SUPER',
      action: 'PAYMENT_RECORDED',
      resource: 'FundTransferRequest',
      resourceId: 'BFT-2026-0004',
      details: JSON.stringify({ actualAmountPaid: 180000, method: 'SLIPS', ref: 'SLIPS-99018241' }),
      status: 'SUCCESS',
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 20),
      userId: createdUsers['sanjay'].id,
      username: 'sanjay',
      role: 'MAIN_ADMIN',
      branchId: 'OFFICE',
      action: 'PAYMENT_VERIFIED',
      resource: 'FundTransferRequest',
      resourceId: 'BFT-2026-0004',
      details: JSON.stringify({ verified: true, status: 'COMPLETED' }),
      status: 'SUCCESS',
    },
  ];

  for (const a of auditLogs) {
    await prisma.auditEvent.create({ data: a });
  }
  console.log(`Seeded ${auditLogs.length} audit logs.`);

  // Synchronize database file to root dev.db
  const fs = require('fs');
  const path = require('path');
  try {
    const rootDb = path.resolve(process.cwd(), 'dev.db');
    const prismaDb = path.resolve(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(prismaDb)) {
      fs.copyFileSync(prismaDb, rootDb);
      console.log('Synchronized database to root dev.db successfully.');
    }
  } catch (err) {
    console.error('Database sync warning:', err);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
