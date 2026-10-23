export type UserRole = 
  | 'SYSTEM_ADMIN'
  | 'FINANCE_ADMIN'
  | 'BRANCH_MANAGER'
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
