# Cash Management System — Quick Start Guide

## 1. Quick Installation & Launch

Run the following commands in the project directory:

```bash
# 1. Install dependencies
npm install

# 2. Push database schema & generate client
npm run db:push

# 3. Seed demonstration master records & branches
npm run db:seed

# 4. Run automated test suite
npm test

# 5. Start the production application
npm run build && npm start
```

Access the application in your browser at: **`http://localhost:3000`**

---

## 2. Seeded Demonstration Accounts

All demo accounts use the standard password: **`Admin@123`**

| Role | Username | Branch Scope | Permitted Operational Focus |
| :--- | :--- | :--- | :--- |
| **Finance Administrator (HO)** | `finance_admin` | Head Office / All | Organization liquidity view, approving inter-branch requests, bank accounts |
| **System Administrator** | `admin` | Organization-Wide | Master branch limits, user provisioning, system configuration |
| **Branch Manager** | `manager_borella` | Borella (`BRL`) | Approving branch-level till floats, investigating discrepancies |
| **Cashier / Teller** | `cashier_borella` | Borella (`BRL`) | Opening/closing till shifts, counting cash notes, requesting float |
| **Cash Custodian / Dispatcher**| `custodian_ho` | Head Office (`HQ`) | Handing over transit cash, sealing security bags, dispatching |
| **Receiving Officer** | `receiver_borella` | Borella (`BRL`) | Independent counting of transit cash, accepting or flagging discrepancies |
| **Auditor (Read-Only)** | `auditor_read` | Organization-Wide | Reviewing double-entry GL journal vouchers, discrepancy logs, audit trail |

*Note: You can instantly switch between any of these roles using the **Simulate Role** dropdown in the top navbar.*

---

## 3. Fast Workflow Demonstration (5 Minutes)

### Step 1: Request Cash Float
1. Set the role to **Cashier / Teller (Borella)**.
2. Click **Cash Transfers** -> **New Cash Request**.
3. Category: **Vault to Cashier Till (Morning Float)**.
4. Source: `Borella Branch Vault`, Destination: `Borella Counter Till 01`.
5. Amount: `LKR 150,000`, Purpose: `Morning counter float`.
6. Submit the request (Transfer Status: `REQUESTED`).

### Step 2: Approve the Request
1. Switch role to **Branch Manager (Borella)**.
2. In the **Cash Transfers** tab, click **Approve** on the new request.
3. Transfer Status changes to `APPROVED`.
*(Notice: If you try to approve as the cashier who created it, the system rejects it under Separation of Duties rules!)*

### Step 3: Dispatch Physical Cash
1. Switch role to **Cash Custodian / Dispatcher**.
2. Click **Dispatch** on the approved request.
3. Enter Tamper-Evident Bag Seal `#` (e.g. `SEC-BAG-1029`).
4. Click **Record & Verify Denomination Breakdown** and click **Exact Match Tally**.
5. Click **Confirm Handover & Dispatch**.
6. The source account is debited, transit escrow is credited, and a double-entry GL voucher is posted!

### Step 4: Receive & Count Cash
1. Switch role to **Receiving Officer (Borella)**.
2. Click **Receive & Count** on the `IN_TRANSIT` transfer.
3. Open the denomination counter and count physical notes.
4. Click **Accept & Credit Vault/Till**.
5. Destination account is credited and transfer is marked `ACCEPTED`!

### Step 5: Verify General Ledger & Audit Trail
1. Switch role to **Auditor (Read-Only)**.
2. Visit **General Ledger** to see the balanced Debit/Credit journal vouchers.
3. Visit **Audit Trail** to see the chronological record of all actions.
