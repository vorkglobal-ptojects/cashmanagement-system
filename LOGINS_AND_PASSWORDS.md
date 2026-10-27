# Branch Management System — Logins & Passwords

System URL: **http://localhost:3000**

---

### 1. Branch Logins (Employees)
Each branch logs in directly using its branch name. The password format is simply `<branchname>123@`.

| Branch Name | Username | Password | Role |
| :--- | :--- | :--- | :--- |
| **Borella** | `borella` | `borella123@` | Branch Employee |
| **Dehiwela** | `dehiwela` | `dehiwela123@` | Branch Employee |
| **Dematagoda** | `dematagoda` | `dematagoda123@` | Branch Employee |
| **Homagama** | `homagama` | `homagama123@` | Branch Employee |
| **Kadawatha** | `kadawatha` | `kadawatha123@` | Branch Employee |
| **Kiribathgoda** | `kiribathgoda` | `kiribathgoda123@` | Branch Employee |
| **Kottawa** | `kottawa` | `kottawa123@` | Branch Employee |
| **Panadura** | `panadura` | `panadura123@` | Branch Employee |
| **Head Office** | `office` | `office123@` | Branch Employee |
| **W3** | `w3` | `w3123@` | Branch Employee |
| **W4** | `w4` | `w4123@` | Branch Employee |
| **Super Branch** | `super` | `super123@` | Branch Employee |

> **Branch Responsibilities**: Customer registration (NIC uniqueness check, bank account details), create interbranch fund transfer requests, and track request statuses.

---

### 2. Manager Login
Cross-branch review and approval authority across all branches.

| Role | Username | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager` | `manager123@` | All 11 Branches |

> **Manager Responsibilities**: View requests submitted across all branches, 1-click Approve or Reject with comments, process direct bank payment, upload receipt advice & medical form.

---

### 3. Administrator Login (Mr. Sanjay)
Complete company-wide oversight and executive approval.

| Role | Username | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123@` | Company-wide (All Branches) |

> **Admin Responsibilities**: Oversight across all branches, approve/reject requests, view receipts and medical forms, access consolidated financial reports and tamper-evident audit history.
