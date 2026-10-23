# Cash Management System (CMS) — User Operations Manual

## 1. System Overview

The **Cash Management System (CMS)** is a standalone, enterprise-grade financial operations platform designed for multi-branch financial institutions in Sri Lanka. It manages physical cash across branches, vaults, counter tills, in-transit escrows, and commercial bank accounts.

Key capabilities include:
- **Dual-Custody Cash Movements**: Strict Separation of Duties (SoD) ensuring no single user can request, approve, dispatch, and receive the same funds.
- **Physical Denomination Tally Verification**: Exact count of Sri Lankan Rupee currency notes (Rs. 5,000, 1,000, 500, 100, 50, 20) and coins.
- **Automatic Discrepancy Detection**: Instant variance calculation on transit receipt and till reconciliation.
- **Balanced Double-Entry General Ledger**: Every cash movement posts balanced Debit and Credit journal vouchers.
- **Immutable Audit Trail**: Tamper-evident logging of all logins, requests, approvals, dispatches, counts, and variance reports.

---

## 2. Roles & Separation of Duties (SoD)

| Role | Primary Responsibilities | Prohibited Actions (Enforced by Server) |
| :--- | :--- | :--- |
| **System Administrator** | User provisioning, branch settings, system configuration, audit review. | Cannot originate or approve operational transactions. |
| **Finance Administrator (HO)** | Organization-wide liquidity monitoring, approving inter-branch and bank transfers, assigning funding sources. | Cannot act as the receiving officer for remote branch vaults. |
| **Branch Manager** | Monitor branch vault and till limits, approve branch-level requests, investigate discrepancies. | Cannot approve their own cash requests. |
| **Cashier / Teller** | Open/close till shifts, count physical cash notes, disburse approved counter transactions. | Cannot approve requests or dispatch inter-branch shipments. |
| **Cash Custodian / Dispatcher**| Physical handover, seal bag verification, courier waybill generation, dispatch denomination counting. | Cannot receive the shipment they dispatched. |
| **Receiving Officer** | Independent physical count of transit cash, sign waybill, accept or flag discrepancies. | Cannot modify the original dispatch amount; must report any count difference. |
| **Auditor (Read-Only)** | Review GL journal vouchers, discrepancy audits, reconciliation logs. | Strictly read-only across all endpoints. |

---

## 3. Core Operational Workflows

### 3.1 Cash Request & Approval
1. **Initiate Request**:
   - A Cashier or Branch Manager navigates to **Cash Transfers** -> **New Cash Request**.
   - Select the Transfer Category (e.g. *Branch-to-Branch*, *Vault-to-Till Opening Float*, *Bank Withdrawal*).
   - Select Funding Source Account and Destination Account.
   - Enter Requested Amount (LKR), Urgency Level, and operational purpose.
   - Click **Submit Cash Request**. Status becomes `REQUESTED`.
2. **Review & Approval**:
   - Finance Administrator (HO) or Branch Manager logs in.
   - Click **Approve** on the pending request.
   - *Enforcement*: The server automatically blocks approval if the acting user is the same person who created the request.
   - Status updates to `APPROVED`.

### 3.2 Physical Cash Dispatch & Handover
1. The **Cash Custodian / Dispatcher** clicks **Dispatch** on an approved transfer.
2. In the Dispatch Console:
   - Enter the **Tamper-Evident Bag Seal #** (e.g. `SEC-BAG-88492`).
   - Enter Waybill #, Courier Company Name, and Transit Officer NIC.
   - Click **Record & Verify Denomination Breakdown**.
   - Count and enter note quantities (Rs. 5,000, 1,000, 500, 100, 50, 20) and coins.
   - The system checks that the physical count equals the approved amount.
3. Click **Confirm Handover & Dispatch**:
   - Source Vault/Till is atomically debited.
   - Cash In-Transit Escrow is credited.
   - A balanced General Ledger journal entry (`CASH_TRANSFER_DISPATCH`) is posted.
   - Status becomes `IN_TRANSIT`.

### 3.3 Cash Receipt & Acceptance
1. The **Receiving Officer** at the destination branch clicks **Receive & Count**.
   - *Enforcement*: The server prevents the dispatcher from acting as the receiver.
2. Review the seal bag number and courier waybill.
3. Click **Open Denomination Matrix & Count Cash** and independently count physical notes received under CCTV.
4. **Discrepancy vs Exact Match**:
   - **Exact Match**: The physical count equals the dispatched amount. Status becomes `ACCEPTED`, destination vault is credited, and transit escrow is cleared.
   - **Discrepancy (Surplus or Shortage)**: If the count differs, a red alert is displayed. Submitting flags the transfer as `DISCREPANCY_FLAGGED`, logs variance reasons, posts a discrepancy adjustment GL voucher, and triggers an audit alert.

### 3.4 Till Shift Opening & End-of-Day Reconciliation
1. **Open Till Shift**:
   - Cashier clicks **Open New Till Shift** on the **Till & Reconcile** tab.
   - Select counter till account and enter the morning float denomination count.
   - Click **Confirm & Open Till Shift**. Status is `OPEN`.
2. **End-of-Day Balancing**:
   - At shift close, the cashier clicks **Count & Reconcile**.
   - Enter the physical closing count into the denomination matrix.
   - System calculates the difference (`Actual Count - System Expected Balance`):
     - `0.00 Variance`: Status becomes `BALANCED`.
     - `Negative Variance`: Status becomes `SHORT`. An automatic shortage expense GL voucher is posted.
     - `Positive Variance`: Status becomes `OVER`. An automatic overage income GL voucher is posted.
