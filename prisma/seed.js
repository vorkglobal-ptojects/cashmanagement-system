const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Cash Management System database...');

  // 1. Clean existing records in reverse relation order
  await prisma.glJournalLine.deleteMany();
  await prisma.glJournalEntry.deleteMany();
  await prisma.denominationTally.deleteMany();
  await prisma.cashTransfer.deleteMany();
  await prisma.tillSession.deleteMany();
  await prisma.cashAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.auditEvent.deleteMany();

  // 2. Seed Branches
  const branches = [
    { id: 'HQ', name: 'Head Office Colombo', code: 'HQ-001', city: 'Colombo 03', cashLimit: 100000000.0 },
    { id: 'BRL', name: 'Borella Branch', code: 'BR-002', city: 'Colombo 08', cashLimit: 8000000.0 },
    { id: 'DEM', name: 'Dematagoda Branch', code: 'BR-003', city: 'Colombo 09', cashLimit: 6000000.0 },
    { id: 'WAT', name: 'Wattala Branch', code: 'BR-004', city: 'Wattala', cashLimit: 7500000.0 },
    { id: 'KAD', name: 'Kadawatha Branch', code: 'BR-005', city: 'Kadawatha', cashLimit: 6000000.0 },
    { id: 'KOT', name: 'Kottawa Branch', code: 'BR-006', city: 'Kottawa', cashLimit: 6000000.0 },
  ];

  for (const b of branches) {
    await prisma.branch.create({ data: b });
  }
  console.log('Seeded branches.');

  // 3. Seed Users with hashed password
  const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);

  const users = [
    {
      username: 'admin',
      email: 'admin@cashmgmt.lk',
      firstName: 'Anura',
      lastName: 'Perera',
      role: 'SYSTEM_ADMIN',
      branchId: null,
      passwordHash: defaultPasswordHash,
    },
    {
      username: 'finance_admin',
      email: 'finance@cashmgmt.lk',
      firstName: 'Chamari',
      lastName: 'Wickramasinghe',
      role: 'FINANCE_ADMIN',
      branchId: 'HQ',
      passwordHash: defaultPasswordHash,
    },
    {
      username: 'manager_borella',
      email: 'mgr.borella@cashmgmt.lk',
      firstName: 'Dhammika',
      lastName: 'Senanayake',
      role: 'BRANCH_MANAGER',
      branchId: 'BRL',
      passwordHash: defaultPasswordHash,
    },
    {
      username: 'manager_dematagoda',
      email: 'mgr.dematagoda@cashmgmt.lk',
      firstName: 'Ruwan',
      lastName: 'Jayawardena',
      role: 'BRANCH_MANAGER',
      branchId: 'DEM',
      passwordHash: defaultPasswordHash,
    },
    {
      username: 'cashier_borella',
      email: 'cashier1.brl@cashmgmt.lk',
      firstName: 'Kavindi',
      lastName: 'Silva',
      role: 'CASHIER',
      branchId: 'BRL',
      passwordHash: defaultPasswordHash,
    },
    {
      username: 'custodian_ho',
      email: 'custodian.ho@cashmgmt.lk',
      firstName: 'Sunil',
      lastName: 'Fernandopulle',
      role: 'DISPATCHER',
      branchId: 'HQ',
      passwordHash: defaultPasswordHash,
    },
    {
      username: 'receiver_borella',
      email: 'receiver.brl@cashmgmt.lk',
      firstName: 'Niroshan',
      lastName: 'Bandara',
      role: 'RECEIVING_OFFICER',
      branchId: 'BRL',
      passwordHash: defaultPasswordHash,
    },
    {
      username: 'auditor_read',
      email: 'auditor@cashmgmt.lk',
      firstName: 'Malini',
      lastName: 'Gunaratne',
      role: 'AUDITOR',
      branchId: null,
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log('Seeded users.');

  // 4. Seed Cash Accounts
  const accounts = [
    {
      accountNumber: 'VAULT-HQ-01',
      name: 'Head Office Central Vault',
      type: 'VAULT',
      branchId: 'HQ',
      balance: 25000000.0,
      maxLimit: 50000000.0,
    },
    {
      accountNumber: 'VAULT-BRL-01',
      name: 'Borella Branch Vault',
      type: 'VAULT',
      branchId: 'BRL',
      balance: 3200000.0,
      maxLimit: 8000000.0,
    },
    {
      accountNumber: 'TILL-BRL-01',
      name: 'Borella Counter Till 01',
      type: 'TILL',
      branchId: 'BRL',
      balance: 450000.0,
      maxLimit: 1000000.0,
    },
    {
      accountNumber: 'VAULT-DEM-01',
      name: 'Dematagoda Branch Vault',
      type: 'VAULT',
      branchId: 'DEM',
      balance: 2100000.0,
      maxLimit: 6000000.0,
    },
    {
      accountNumber: 'TILL-DEM-01',
      name: 'Dematagoda Counter Till 01',
      type: 'TILL',
      branchId: 'DEM',
      balance: 300000.0,
      maxLimit: 800000.0,
    },
    {
      accountNumber: 'VAULT-WAT-01',
      name: 'Wattala Branch Vault',
      type: 'VAULT',
      branchId: 'WAT',
      balance: 1800000.0,
      maxLimit: 7500000.0,
    },
    {
      accountNumber: 'BANK-COMBANK-01',
      name: 'Commercial Bank Corporate Operating Account',
      type: 'BANK_ACCOUNT',
      branchId: null,
      bankName: 'Commercial Bank of Ceylon PLC',
      bankAccountNo: '10008492019',
      balance: 45000000.0,
    },
    {
      accountNumber: 'BANK-BOC-01',
      name: 'Bank of Ceylon Reserve Account',
      type: 'BANK_ACCOUNT',
      branchId: null,
      bankName: 'Bank of Ceylon',
      bankAccountNo: '8839201928',
      balance: 30000000.0,
    },
  ];

  const createdAccounts = {};
  for (const acc of accounts) {
    const record = await prisma.cashAccount.create({ data: acc });
    createdAccounts[acc.accountNumber] = record;
  }
  console.log('Seeded cash accounts.');

  // 5. Seed sample transfer in progress (IN_TRANSIT)
  const sampleTransfer = await prisma.cashTransfer.create({
    data: {
      transferNumber: 'CTR-2026-00001',
      transferType: 'BRANCH_TO_BRANCH',
      sourceAccountId: createdAccounts['VAULT-HQ-01'].id,
      destinationAccountId: createdAccounts['VAULT-BRL-01'].id,
      fromBranchId: 'HQ',
      toBranchId: 'BRL',
      requestedAmount: 1500000.0,
      approvedAmount: 1500000.0,
      dispatchedAmount: 1500000.0,
      status: 'IN_TRANSIT',
      urgency: 'HIGH',
      purpose: 'End-of-week liquidity replenishment for pawning disbursements',
      securityBagNumber: 'SEC-BAG-88492',
      vehicleNumber: 'WP-CAD-4920',
      courierName: 'Certis Lanka Security Transport',
      courierNic: '198429104928',
      waybillNumber: 'WB-2026-00492',
      requestedByUserId: 'finance_admin',
      requestedByUsername: 'Chamari Wickramasinghe',
      approvedByUserId: 'finance_admin',
      approvedByUsername: 'Chamari Wickramasinghe',
      dispatchedByUserId: 'custodian_ho',
      dispatchedByUsername: 'Sunil Fernandopulle',
      requestedAt: new Date(Date.now() - 3600 * 1000 * 3),
      approvedAt: new Date(Date.now() - 3600 * 1000 * 2),
      dispatchedAt: new Date(Date.now() - 3600 * 1000 * 1),
    },
  });

  // Tally for sample dispatch
  await prisma.denominationTally.create({
    data: {
      stage: 'DISPATCH',
      transferId: sampleTransfer.id,
      note5000: 200, // 1,000,000
      note1000: 450, // 450,000
      note500: 100,  // 50,000
      note100: 0,
      note50: 0,
      note20: 0,
      coins: 0.0,
      totalCalculated: 1500000.0,
      countedByUserId: 'custodian_ho',
      countedByName: 'Sunil Fernandopulle',
    },
  });

  // Balanced Journal Voucher for sample dispatch
  const jv = await prisma.glJournalEntry.create({
    data: {
      entryNumber: 'JV-2026-00001',
      branchId: 'HQ',
      referenceType: 'CASH_TRANSFER_DISPATCH',
      referenceId: sampleTransfer.id,
      description: 'Cash Dispatch CTR-2026-00001 from Head Office Central Vault to Borella',
      totalDebit: 1500000.0,
      totalCredit: 1500000.0,
      lines: {
        create: [
          {
            accountId: 'IN_TRANSIT_ESCROW',
            accountName: 'Cash In-Transit (Escrow Asset)',
            debit: 1500000.0,
            credit: 0.0,
            memo: 'Under transit to Borella Vault',
          },
          {
            accountId: createdAccounts['VAULT-HQ-01'].id,
            accountName: 'Head Office Central Vault',
            debit: 0.0,
            credit: 1500000.0,
            memo: 'Dispatched under Seal #SEC-BAG-88492',
          },
        ],
      },
    },
  });

  // Seed sample Pending Cash Request
  await prisma.cashTransfer.create({
    data: {
      transferNumber: 'CTR-2026-00002',
      transferType: 'VAULT_TO_TILL',
      sourceAccountId: createdAccounts['VAULT-BRL-01'].id,
      destinationAccountId: createdAccounts['TILL-BRL-01'].id,
      fromBranchId: 'BRL',
      toBranchId: 'BRL',
      requestedAmount: 300000.0,
      status: 'REQUESTED',
      urgency: 'NORMAL',
      purpose: 'Morning Counter Till Opening Float replenishment',
      requestedByUserId: 'cashier_borella',
      requestedByUsername: 'Kavindi Silva',
      requestedAt: new Date(),
    },
  });

  // Seed Initial Audit Event
  await prisma.auditEvent.create({
    data: {
      username: 'SYSTEM',
      action: 'SYSTEM_INITIALIZATION',
      resource: 'System',
      details: JSON.stringify({ message: 'Clean standalone Cash Management System initialized with master records' }),
      status: 'SUCCESS',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
