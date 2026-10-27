import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const existingBranches = await ctx.db.query("branches").take(1);
    if (existingBranches.length > 0) {
      return { message: "Database already seeded. Skipping." };
    }

    const now = Date.now();

    // 1. Seed Branches
    const branchesData = [
      { code: "HQ-001", name: "Head Office Colombo", city: "Colombo 03", cashLimit: 100000000.0, isActive: true },
      { code: "BR-002", name: "Borella Branch", city: "Colombo 08", cashLimit: 8000000.0, isActive: true },
      { code: "DEM-003", name: "Dematagoda Branch", city: "Colombo 09", cashLimit: 6000000.0, isActive: true },
      { code: "WAT-004", name: "Wattala Branch", city: "Wattala", cashLimit: 7500000.0, isActive: true },
      { code: "KAD-005", name: "Kadawatha Branch", city: "Kadawatha", cashLimit: 6000000.0, isActive: true },
      { code: "KOT-006", name: "Kottawa Branch", city: "Kottawa", cashLimit: 6000000.0, isActive: true },
    ];

    const branchMap = new Map();
    for (const b of branchesData) {
      const id = await ctx.db.insert("branches", {
        ...b,
        createdAt: now,
        updatedAt: now,
      });
      branchMap.set(b.code, id);
    }

    const hqId = branchMap.get("HQ-001");
    const brlId = branchMap.get("BR-002");
    const demId = branchMap.get("DEM-003");

    // 2. Seed Users
    const defaultPasswordHash = "$2a$10$wN31V2x/430P.3iB3E8mue03K4F9Q8hMsz9r.0M8W.eP88pU3s.uO"; // Admin@123

    const usersData = [
      {
        username: "admin",
        email: "admin@cashmgmt.lk",
        firstName: "Anura",
        lastName: "Perera",
        role: "SYSTEM_ADMIN",
        branchId: undefined,
        branchCode: "HQ",
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
      {
        username: "finance_admin",
        email: "finance@cashmgmt.lk",
        firstName: "Chamari",
        lastName: "Wickramasinghe",
        role: "FINANCE_ADMIN",
        branchId: hqId,
        branchCode: "HQ",
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
      {
        username: "manager_borella",
        email: "mgr.borella@cashmgmt.lk",
        firstName: "Dhammika",
        lastName: "Senanayake",
        role: "BRANCH_MANAGER",
        branchId: brlId,
        branchCode: "BRL",
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
      {
        username: "cashier_borella",
        email: "cashier1.brl@cashmgmt.lk",
        firstName: "Kavindi",
        lastName: "Silva",
        role: "CASHIER",
        branchId: brlId,
        branchCode: "BRL",
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
      {
        username: "custodian_ho",
        email: "custodian.ho@cashmgmt.lk",
        firstName: "Sunil",
        lastName: "Fernandopulle",
        role: "DISPATCHER",
        branchId: hqId,
        branchCode: "HQ",
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
      {
        username: "receiver_borella",
        email: "receiver.brl@cashmgmt.lk",
        firstName: "Niroshan",
        lastName: "Bandara",
        role: "RECEIVING_OFFICER",
        branchId: brlId,
        branchCode: "BRL",
        passwordHash: defaultPasswordHash,
        isActive: true,
      },
    ];

    for (const u of usersData) {
      await ctx.db.insert("users", {
        ...u,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 3. Seed Cash Accounts
    const accountsData = [
      { accountNumber: "VAULT-HQ-01", name: "Head Office Central Vault", type: "VAULT", branchId: hqId, branchCode: "HQ", currency: "LKR", balance: 50000000.0, status: "ACTIVE" },
      { accountNumber: "VAULT-BRL-01", name: "Borella Main Vault", type: "VAULT", branchId: brlId, branchCode: "BRL", currency: "LKR", balance: 4500000.0, status: "ACTIVE" },
      { accountNumber: "TILL-BRL-01", name: "Borella Counter Till 01", type: "TILL", branchId: brlId, branchCode: "BRL", currency: "LKR", balance: 350000.0, status: "ACTIVE" },
      { accountNumber: "IN-TRANSIT-GLOBAL", name: "Global Cash In-Transit Holding", type: "IN_TRANSIT", branchId: undefined, branchCode: "GLOBAL", currency: "LKR", balance: 0.0, status: "ACTIVE" },
      { accountNumber: "BANK-BOC-01", name: "Bank of Ceylon Corporate Account", type: "BANK_ACCOUNT", branchId: hqId, branchCode: "HQ", currency: "LKR", balance: 150000000.0, bankName: "Bank of Ceylon", bankAccountNo: "7040019283", status: "ACTIVE" },
    ];

    for (const acc of accountsData) {
      await ctx.db.insert("cashAccounts", {
        ...acc,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 4. Log initial audit event
    await ctx.db.insert("auditEvents", {
      timestamp: now,
      username: "SYSTEM",
      role: "SYSTEM_ADMIN",
      action: "CONVEX_INITIAL_SEED",
      resource: "Database",
      details: JSON.stringify({ message: "Convex database seeded with standard initial CMS data" }),
      status: "SUCCESS",
    });

    return { success: true, message: "Convex database successfully initialized and seeded." };
  },
});
