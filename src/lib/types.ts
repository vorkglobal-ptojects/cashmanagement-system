export type UserRole = 
  | 'MAIN_ADMIN'       // Mr. Sanjay (Centralized access to all 11 branches)
  | 'BRANCH_MANAGER'   // Branch Managers (Approve, reject, pay, upload receipt, verify)
  | 'BRANCH_EMPLOYEE'  // Branch Employees (Register customers, submit requests, track status)
  | 'SYSTEM_ADMIN'     // System Administrator (Full technical access)
  | 'FINANCE_ADMIN'    // Finance Director
  | 'CASHIER'
  | 'DISPATCHER'
  | 'RECEIVING_OFFICER'
  | 'AUDITOR';

export interface AuthSession {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  branchId: string | null;
  branchName?: string;
  firstName: string;
  lastName: string;
}

export type FundTransferStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED_AWAITING_PAYMENT'
  | 'REJECTED'
  | 'PAYMENT_SUBMITTED_AWAITING_VERIFICATION'
  | 'VERIFICATION_REQUIRED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'SLIPS' | 'CEFT' | 'RTGS' | 'INTERNAL_BANK_TRANSFER';

export interface Customer {
  id: string; // e.g. "CUST-2026-0001"
  fullName: string;
  nicNumber: string;
  address: string;
  phoneNumber: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  accountHolderName: string;
  registrationDate: string;
  registeringUserId: string;
  registeringBranchId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
  registeringBranch?: {
    id: string;
    name: string;
    code: string;
  };
  rawNic?: string;
  rawBankAccount?: string;
  fundTransfers?: FundTransferRequest[];
}

export interface FundTransferRequest {
  id: string; // e.g. "BFT-2026-0001"
  requestNumber?: string; // alias for id
  customerId: string;
  customerName?: string;
  customerNic?: string;
  bankName?: string;
  requestingBranchId: string;
  fundingBranchId: string;
  requestedAmount: number;
  currency: string;
  reason: string;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  additionalNotes?: string | null;
  requestDate: string;
  
  requestingUserId: string;
  requestingUserName: string;
  status: FundTransferStatus;
  
  // Approval Workflow
  approvedByUserId?: string | null;
  approvedByUserName?: string | null;
  approvedByName?: string | null;
  approvalDecision?: 'APPROVED' | 'REJECTED' | null;
  approvalNotes?: string | null;
  approvalDate?: string | null;
  rejectionReason?: string | null;
  
  // Direct Bank Payment
  actualAmountPaid?: number | null;
  paymentDate?: string | null;
  paymentMethod?: PaymentMethod | null;
  bankTransactionReference?: string | null;
  bankReference?: string | null;
  paidByUserId?: string | null;
  paidByUserName?: string | null;
  paymentNotes?: string | null;
  
  // Receipt Upload & Confirmation
  receiptUrl?: string | null;
  receiptFileName?: string | null;
  receiptMimeType?: string | null;
  receiptUploadedAt?: string | null;
  receiptUploadedByUserId?: string | null;
  receiptUploadedByUserName?: string | null;
  
  // Verification
  verifiedByUserId?: string | null;
  verifiedByUserName?: string | null;
  verifiedAt?: string | null;
  verificationStatus?: 'VERIFIED' | 'FLAGGED_FOR_REVIEW' | null;
  verificationNotes?: string | null;
  
  createdAt: string;
  updatedAt: string;
  
  customer?: Customer;
  requestingBranch?: {
    id: string;
    name: string;
    code: string;
    city?: string;
  };
  fundingBranch?: {
    id: string;
    name: string;
    code: string;
    city?: string;
  };
}

export interface AppNotification {
  id: string;
  recipientUserId?: string | null;
  recipientRole?: string | null;
  recipientBranchId?: string | null;
  title: string;
  message: string;
  link?: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// Vault & Till transfers (backward compatibility)
export type TransferStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'ACCEPTED'
  | 'DISCREPANCY_FLAGGED'
  | 'CANCELLED';

export type TransferType =
  | 'BRANCH_TO_BRANCH'
  | 'VAULT_TO_TILL'
  | 'TILL_TO_VAULT'
  | 'BANK_WITHDRAWAL'
  | 'BANK_DEPOSIT';

export interface DenominationBreakdown {
  note5000: number;
  note1000: number;
  note500: number;
  note100: number;
  note50: number;
  note20: number;
  coins: number;
}
