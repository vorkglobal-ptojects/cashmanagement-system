import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Branch table
  branches: defineTable({
    code: v.string(), // e.g. "HQ-001", "BR-002"
    name: v.string(), // e.g. "Head Office Colombo"
    city: v.string(), // e.g. "Colombo 03"
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    cashLimit: v.number(), // Max cash holding allowed in branch (e.g. 5,000,000.0)
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_isActive", ["isActive"]),

  // 2. User table
  users: defineTable({
    username: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.string(), // SYSTEM_ADMIN, FINANCE_ADMIN, BRANCH_MANAGER, CASHIER, DISPATCHER, RECEIVING_OFFICER, AUDITOR
    branchId: v.optional(v.id("branches")), // null for consolidated Head Office / System Admin
    branchCode: v.optional(v.string()),
    isActive: v.boolean(),
    phone: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"])
    .index("by_branch", ["branchId"])
    .index("by_role", ["role"]),

  // 3. CashAccount table (Vaults, Tills, Bank Accounts, In-Transit)
  cashAccounts: defineTable({
    accountNumber: v.string(), // e.g. "VAULT-HQ-01", "TILL-BRL-01", "BANK-COMBANK-01"
    name: v.string(),
    type: v.string(), // VAULT, TILL, BANK_ACCOUNT, IN_TRANSIT
    branchId: v.optional(v.id("branches")), // null for global accounts (e.g. In-Transit, Central Banks)
    branchCode: v.optional(v.string()),
    currency: v.string(), // e.g. "LKR"
    balance: v.number(),
    maxLimit: v.optional(v.number()),
    bankName: v.optional(v.string()),
    bankAccountNo: v.optional(v.string()),
    status: v.string(), // ACTIVE, FROZEN, CLOSED
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_accountNumber", ["accountNumber"])
    .index("by_branch", ["branchId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // 4. CashTransfer table (Multi-state inter-branch and till transfers)
  cashTransfers: defineTable({
    transferNumber: v.string(), // e.g. "CTR-2026-0001"
    transferType: v.string(), // BRANCH_TO_BRANCH, VAULT_TO_TILL, TILL_TO_VAULT, BANK_WITHDRAWAL, BANK_DEPOSIT
    sourceAccountId: v.id("cashAccounts"),
    destinationAccountId: v.id("cashAccounts"),
    fromBranchId: v.optional(v.id("branches")),
    toBranchId: v.optional(v.id("branches")),

    requestedAmount: v.number(),
    approvedAmount: v.optional(v.number()),
    dispatchedAmount: v.optional(v.number()),
    receivedAmount: v.optional(v.number()),
    varianceAmount: v.number(), // default 0.0
    currency: v.string(), // e.g. "LKR"

    status: v.string(), // DRAFT, REQUESTED, APPROVED, REJECTED, ASSIGNED, DISPATCHED, IN_TRANSIT, RECEIVED, ACCEPTED, DISCREPANCY_FLAGGED, CANCELLED
    urgency: v.string(), // LOW, NORMAL, HIGH, CRITICAL
    purpose: v.string(),

    // Security and Transportation Details
    securityBagNumber: v.optional(v.string()),
    vehicleNumber: v.optional(v.string()),
    courierName: v.optional(v.string()),
    courierNic: v.optional(v.string()),
    waybillNumber: v.optional(v.string()),
    discrepancyReason: v.optional(v.string()),

    // Separation of Duties Actor IDs and Usernames
    requestedByUserId: v.string(),
    requestedByUsername: v.string(),
    approvedByUserId: v.optional(v.string()),
    approvedByUsername: v.optional(v.string()),
    dispatchedByUserId: v.optional(v.string()),
    dispatchedByUsername: v.optional(v.string()),
    receivedByUserId: v.optional(v.string()),
    receivedByUsername: v.optional(v.string()),
    acceptedByUserId: v.optional(v.string()),
    acceptedByUsername: v.optional(v.string()),

    requestedAt: v.number(),
    approvedAt: v.optional(v.number()),
    dispatchedAt: v.optional(v.number()),
    receivedAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_transferNumber", ["transferNumber"])
    .index("by_status", ["status"])
    .index("by_fromBranch", ["fromBranchId"])
    .index("by_toBranch", ["toBranchId"])
    .index("by_sourceAccount", ["sourceAccountId"])
    .index("by_destinationAccount", ["destinationAccountId"]),

  // 5. DenominationTally table
  denominationTallies: defineTable({
    stage: v.string(), // DISPATCH, RECEIPT, TILL_OPEN, TILL_CLOSE
    transferId: v.optional(v.id("cashTransfers")),
    tillSessionId: v.optional(v.id("tillSessions")),

    note5000: v.number(),
    note1000: v.number(),
    note500: v.number(),
    note100: v.number(),
    note50: v.number(),
    note20: v.number(),
    coins: v.number(),
    totalCalculated: v.number(),

    countedByUserId: v.string(),
    countedByName: v.string(),
    verifiedByUserId: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_transfer", ["transferId"])
    .index("by_tillSession", ["tillSessionId"]),

  // 6. TillSession table
  tillSessions: defineTable({
    sessionCode: v.string(), // e.g. "TIL-20261023-BRL-01"
    tillAccountId: v.id("cashAccounts"),
    cashierUserId: v.id("users"),
    cashierUsername: v.string(),
    supervisorUserId: v.optional(v.string()),
    supervisorUsername: v.optional(v.string()),
    branchId: v.id("branches"),

    openedAt: v.number(),
    closedAt: v.optional(v.number()),
    status: v.string(), // OPEN, BALANCED, OVER, SHORT, FORCE_CLOSED

    openingBalance: v.number(),
    cashIn: v.number(),
    cashOut: v.number(),
    expectedClosingBalance: v.number(),
    actualClosingBalance: v.optional(v.number()),
    variance: v.number(),
    reconciliationNotes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sessionCode", ["sessionCode"])
    .index("by_branch", ["branchId"])
    .index("by_cashier", ["cashierUserId"])
    .index("by_status", ["status"])
    .index("by_tillAccount", ["tillAccountId"]),

  // 7. GlJournalEntry table with embedded lines
  glJournalEntries: defineTable({
    entryNumber: v.string(), // e.g. "JV-2026-0001"
    postingDate: v.number(),
    branchId: v.optional(v.id("branches")),
    referenceType: v.string(), // CASH_TRANSFER_DISPATCH, CASH_TRANSFER_ACCEPT, TILL_OPEN, TILL_VARIANCE
    referenceId: v.string(),
    description: v.string(),
    totalDebit: v.number(),
    totalCredit: v.number(),
    lines: v.array(
      v.object({
        accountId: v.string(),
        accountName: v.string(),
        debit: v.number(),
        credit: v.number(),
        memo: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_entryNumber", ["entryNumber"])
    .index("by_referenceId", ["referenceId"])
    .index("by_postingDate", ["postingDate"])
    .index("by_branch", ["branchId"]),

  // 8. AuditEvent table
  auditEvents: defineTable({
    timestamp: v.number(),
    userId: v.optional(v.string()),
    username: v.optional(v.string()),
    role: v.optional(v.string()),
    branchId: v.optional(v.string()),
    action: v.string(), // LOGIN, LOGOUT, REQUEST_SUBMITTED, etc.
    resource: v.string(), // CashTransfer, TillSession, User, Branch, etc.
    resourceId: v.optional(v.string()),
    details: v.string(), // JSON string
    ipAddress: v.optional(v.string()),
    status: v.string(), // SUCCESS, FAILURE, REJECTED
  })
    .index("by_action", ["action"])
    .index("by_resource", ["resource"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId"]),

  // 9. Customers table
  customers: defineTable({
    customerId: v.string(), // e.g. "CUST-2026-0001"
    fullName: v.string(),
    nicNumber: v.string(),
    address: v.string(),
    phoneNumber: v.string(),
    bankName: v.string(),
    bankBranch: v.string(),
    bankAccountNumber: v.string(),
    accountHolderName: v.string(),
    registrationDate: v.number(),
    registeringUserId: v.string(),
    registeringBranchId: v.string(),
    status: v.string(), // ACTIVE, SUSPENDED
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_customerId", ["customerId"])
    .index("by_nicNumber", ["nicNumber"])
    .index("by_branch", ["registeringBranchId"]),

  // 10. FundTransferRequests table
  fundTransferRequests: defineTable({
    requestId: v.string(), // e.g. "BFT-2026-0001"
    customerId: v.string(),
    requestingBranchId: v.string(),
    fundingBranchId: v.string(),
    requestedAmount: v.number(),
    currency: v.string(),
    reason: v.string(),
    additionalNotes: v.optional(v.string()),
    requestDate: v.number(),
    
    requestingUserId: v.string(),
    requestingUserName: v.string(),
    status: v.string(), // PENDING_APPROVAL, APPROVED_AWAITING_PAYMENT, REJECTED, PAYMENT_SUBMITTED_AWAITING_VERIFICATION, VERIFICATION_REQUIRED, COMPLETED, CANCELLED

    // Approval
    approvedByUserId: v.optional(v.string()),
    approvedByUserName: v.optional(v.string()),
    approvalDecision: v.optional(v.string()),
    approvalNotes: v.optional(v.string()),
    approvalDate: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),

    // Payment
    actualAmountPaid: v.optional(v.number()),
    paymentDate: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
    bankTransactionReference: v.optional(v.string()),
    paidByUserId: v.optional(v.string()),
    paidByUserName: v.optional(v.string()),
    paymentNotes: v.optional(v.string()),

    // Receipt
    receiptUrl: v.optional(v.string()),
    receiptFileName: v.optional(v.string()),
    receiptMimeType: v.optional(v.string()),
    receiptUploadedAt: v.optional(v.number()),
    receiptUploadedByUserId: v.optional(v.string()),
    receiptUploadedByUserName: v.optional(v.string()),

    // Verification
    verifiedByUserId: v.optional(v.string()),
    verifiedByUserName: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
    verificationStatus: v.optional(v.string()),
    verificationNotes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requestId", ["requestId"])
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_requestingBranch", ["requestingBranchId"])
    .index("by_fundingBranch", ["fundingBranchId"]),

  // 11. In-App Notifications table
  notifications: defineTable({
    recipientUserId: v.optional(v.string()),
    recipientRole: v.optional(v.string()),
    recipientBranchId: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    type: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["recipientUserId"])
    .index("by_role", ["recipientRole"])
    .index("by_branch", ["recipientBranchId"]),
});
