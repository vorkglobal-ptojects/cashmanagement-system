# Centralized Branch Fund Transfer Management System — Quick Start Guide

A full-stack, company-branded financial management application for an institution operating 11 branches. Built with Next.js 15, TypeScript, Prisma (SQLite / PostgreSQL), Convex, and customized to the company's uploaded brand logo.

---

## 1. Quick Launch

```bash
# 1. Install dependencies
npm install

# 2. Push database schema & generate client
npm run db:push

# 3. Seed demonstration master records & 11 branches
npm run db:seed

# 4. Run automated test suite (13 passing tests)
npm test

# 5. Start development or production server
npm run dev
# or: npm run build && npm start
```

Access the application in your browser at: **`http://localhost:3000`**

---

## 2. Seeded User Accounts (Role-Based Access Control)

All demonstration accounts use the password: **`Admin@123`**

| Role | Username | Branch Scope | Permitted Operational Focus |
| :--- | :--- | :--- | :--- |
| **Main Administrator** | `sanjay` | **All 11 Branches** | Centralized access across all branches, view all customers, approve/reject any funding request, track all transactions, verify receipts, view audit logs, manage branches & users |
| **Branch Manager** | `manager_borella` | Borella (`BRL`) | View funding requests from all branches, approve/reject requests, record customer bank payments, upload receipts, verify transactions |
| **Branch Manager** | `manager_office` | Office (`OFFICE`) | Authorize disbursements, review receipts, execute direct bank payments |
| **Branch Manager** | `manager_super` | SUPER (`SUPER`) | Regional super branch approvals, liquidity management |
| **Branch Employee** | `employee_borella` | Borella (`BRL`) | Register customers, submit interbranch transfer requests, track statuses |
| **Branch Employee** | `employee_homagama`| Homagama (`HOM`) | Customer KYC registration, funding requests, payment progress tracking |
| **Branch Employee** | `employee_panadura`| Panadura (`PAN`) | Customer registration, transfer tracking, view confirmations |

*Note: You can instantly switch between any of these roles using the **Switch User** dropdown in the top navbar.*

---

## 3. Configured 11 Branches (+ Office & SUPER)

The system dynamically supports all 11 branches without hardcoded branch pairs. Any branch can request funds from any other branch:

1. **SUPER** (Super Branch / Regional Vault)
2. **Borella** (`BRL`)
3. **Dehiwela** (`DEH`)
4. **Dematagoda** (`DEM`)
5. **Homagama** (`HOM`)
6. **Kadawatha** (`KAD`)
7. **Kiribathgoda** (`KIR`)
8. **Kottawa** (`KOT`)
9. **Office** (`OFFICE` / Head Office Central Operations)
10. **Panadura** (`PAN`)
11. **W3** (`W3` / Colombo West 03)
12. **W4** (`W4` / Colombo West 04)

---

## 4. End-to-End Acceptance Workflow (5 Minutes)

### Step 1: Employee Registers Customer
1. Select role **Branch Employee (Borella)**.
2. Navigate to **Customers** tab -> Click **Register New Customer**.
3. Fill customer name, NIC (`198512304567`), phone, address, and bank account details (Bank, Branch, Account Number, Account Holder).
4. System automatically checks for duplicate NIC and generates unique ID `CUST-2026-XXXX`.

### Step 2: Employee Submits Fund Transfer Request
1. Click **Fund Transfers** tab -> Click **New Transfer Request**.
2. Select the registered customer.
3. Choose **Requesting Branch** (e.g. `Borella`) and **Funding Branch** (e.g. `Office` or `SUPER`).
4. Enter amount (e.g. `LKR 350,000.00`) and reason.
5. Submit. Request status becomes **Pending Approval** (Amber badge).
6. In-app notification automatically alerts Mr. Sanjay and Branch Managers.

### Step 3: Authorization (Manager or Mr. Sanjay)
1. Switch role to **Mr. Sanjay (Main Administrator)** or **Manager Borella**.
2. Open the request under **Dashboard** or **Fund Transfers**.
3. Click **Authorize & Approve Request** (or **Reject** with mandatory reason).
4. Status transitions to **Approved — Awaiting Payment** (Cyan badge).
5. Duplicate approval attempts are strictly blocked.

### Step 4: Direct-to-Customer Bank Payment & Receipt Upload
1. As an authorized officer, open the approved request.
2. View verified customer bank details (Bank name, branch, account number, account holder).
3. Execute direct bank transfer via authorized banking channel (LankaPay CEFT, SLIPS, RTGS).
4. Enter Actual Amount Paid, Payment Method, and Bank Transaction Reference (e.g. `CEFT-78291048`).
5. Upload payment confirmation receipt advice (PDF, JPG, PNG).
6. Submit. Status transitions to **Payment Submitted — Awaiting Verification** (Violet badge).

### Step 5: Independent Verification & Confirmation
1. As **Mr. Sanjay** or an authorized Manager, open the transaction.
2. Review the uploaded receipt advice in high-resolution preview.
3. Click **Confirm Receipt & Mark Completed**.
4. Status transitions to **Completed & Verified** (Emerald Green badge).
5. If the receipt has issues, click **Flag for Review** to mark as **Verification Required** (Flame Orange badge).

### Step 6: Audit Trail & Customer Profile
1. Open the customer's dedicated profile from the **Customers** tab to see the entire chronological history.
2. View the **Audit Logs** tab to inspect the immutable chronological record of every registration, request, approval, payment, and verification.
