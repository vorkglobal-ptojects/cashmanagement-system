import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateUserGuidePdf() {
  const pdfDoc = await PDFDocument.create();

  // Color Palette
  const navyColor = rgb(19 / 255, 38 / 255, 68 / 255);       // #132644
  const tealColor = rgb(8 / 255, 127 / 255, 112 / 255);      // #087f70
  const lightBg = rgb(244 / 255, 246 / 255, 249 / 255);      // #f4f6f9
  const cardBg = rgb(248 / 255, 250 / 255, 252 / 255);       // #f8fafc
  const darkGray = rgb(30 / 255, 41 / 255, 59 / 255);       // #1e293b
  const mutedGray = rgb(100 / 255, 116 / 255, 139 / 255);   // #64748b
  const borderGray = rgb(226 / 255, 232 / 255, 240 / 255);  // #e2e8f0
  const amberColor = rgb(180 / 255, 83 / 255, 9 / 255);     // #b45309
  const greenColor = rgb(22 / 255, 101 / 255, 52 / 255);     // #166534
  const redColor = rgb(185 / 255, 28 / 255, 28 / 255);       // #b91c1c
  const white = rgb(1, 1, 1);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // ================= PAGE 1: ROLE ARCHITECTURE & SYSTEM RULES =================
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 Size in points
  const { width, height } = page1.getSize();

  // Top Header Banner
  page1.drawRectangle({
    x: 0,
    y: height - 90,
    width: width,
    height: 90,
    color: navyColor,
  });

  page1.drawText('COMPANY FINANCE', {
    x: 36,
    y: height - 38,
    size: 20,
    font: fontBold,
    color: white,
  });

  page1.drawText('BRANCH FUND TRANSFER MANAGEMENT SYSTEM — USER GUIDE & RULES', {
    x: 36,
    y: height - 56,
    size: 9.5,
    font: fontBold,
    color: tealColor,
  });

  page1.drawText('Version 2.0 • Published October 2026 • Official Operating Governance Document', {
    x: 36,
    y: height - 74,
    size: 8.5,
    font: fontRegular,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  let y = height - 118;

  // SECTION 1: ROLE DEFINITIONS & PERMISSIONS MATRIX
  page1.drawText('1. USER ROLE PERMISSIONS & RESPONSIBILITIES', { x: 36, y, size: 12, font: fontBold, color: navyColor });
  y -= 16;

  // Employee Card
  page1.drawRectangle({
    x: 36,
    y: y - 110,
    width: width - 72,
    height: 110,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });
  page1.drawRectangle({ x: 36, y: y - 24, width: width - 72, height: 24, color: lightBg });
  page1.drawText('BRANCH EMPLOYEE (All 11 Branches: Borella, Dehiwela, Homagama, Panadura, etc.)', { x: 46, y: y - 16, size: 9, font: fontBold, color: darkGray });

  page1.drawText('PERMITTED TASKS (STRICTLY CONFINED TO TWO ACTIONS):', { x: 46, y: y - 38, size: 8, font: fontBold, color: greenColor });
  page1.drawText('1. Register Customers: Capture Full Name, NIC, Address, Phone, Bank, Branch, and Account Number with KYC validation.', { x: 50, y: y - 50, size: 7.8, font: fontRegular, color: darkGray });
  page1.drawText('2. Create Fund Transfer Requests: Select registered customer, choose funding branch, specify amount and reason.', { x: 50, y: y - 62, size: 7.8, font: fontRegular, color: darkGray });
  page1.drawText('3. Track & Retrieve: View request approval progress and download/inspect the uploaded bank payment receipt.', { x: 50, y: y - 74, size: 7.8, font: fontRegular, color: darkGray });

  page1.drawText('STRICT RESTRICTIONS:', { x: 46, y: y - 88, size: 8, font: fontBold, color: redColor });
  page1.drawText('• Employees CANNOT approve, reject, or disburse cash/bank payments under any circumstance.', { x: 50, y: y - 100, size: 7.8, font: fontRegular, color: redColor });

  y -= 124;

  // Manager Card
  page1.drawRectangle({
    x: 36,
    y: y - 100,
    width: width - 72,
    height: 100,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });
  page1.drawRectangle({ x: 36, y: y - 24, width: width - 72, height: 24, color: lightBg });
  page1.drawText('BRANCH MANAGER (Central Branch Operations & Review)', { x: 46, y: y - 16, size: 9, font: fontBold, color: darkGray });

  page1.drawText('PERMITTED POWERS & DUTIES:', { x: 46, y: y - 38, size: 8, font: fontBold, color: greenColor });
  page1.drawText('1. Cross-Branch Approval Inbox: Review all incoming transfer requests from all 11 branches in real-time.', { x: 50, y: y - 50, size: 7.8, font: fontRegular, color: darkGray });
  page1.drawText('2. 1-Click Approve / Reject: Make binding approval decisions. Rejections require a documented justification.', { x: 50, y: y - 62, size: 7.8, font: fontRegular, color: darkGray });
  page1.drawText('3. Payment Execution & Receipt Upload: Disburse funds directly to customer account and attach PDF/image receipt.', { x: 50, y: y - 74, size: 7.8, font: fontRegular, color: darkGray });
  page1.drawText('4. Multi-Branch History: Full visibility over chronological transfer ledgers, timestamps, and audit records.', { x: 50, y: y - 86, size: 7.8, font: fontRegular, color: darkGray });

  y -= 114;

  // Admin Card
  page1.drawRectangle({
    x: 36,
    y: y - 100,
    width: width - 72,
    height: 100,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });
  page1.drawRectangle({ x: 36, y: y - 24, width: width - 72, height: 24, color: lightBg });
  page1.drawText('MAIN ADMINISTRATOR / MR. SANJAY (Executive Approver & Head Office)', { x: 46, y: y - 16, size: 9, font: fontBold, color: darkGray });

  page1.drawText('EXECUTIVE AUTHORITY:', { x: 46, y: y - 38, size: 8, font: fontBold, color: greenColor });
  page1.drawText('1. Institution-Wide Governance: Supreme visibility across all 11 branch operations, accounts, and customer rosters.', { x: 50, y: y - 50, size: 7.8, font: fontRegular, color: darkGray });
  page1.drawText('2. Executive Approval Authority: Either Manager or Mr. Sanjay can approve; single decision locked immediately.', { x: 50, y: y - 62, size: 7.8, font: fontRegular, color: darkGray });
  page1.drawText('3. Independent Verification: Verify uploaded payment receipts against treasury accounts and mark status Verified.', { x: 50, y: y - 74, size: 7.8, font: fontRegular, color: darkGray });
  page1.drawText('4. Tamper-Evident Audit Trail: Complete access to system audit logs, user management, and compliance ledgers.', { x: 50, y: y - 86, size: 7.8, font: fontRegular, color: darkGray });

  y -= 118;

  // SECTION 2: CORE GOVERNANCE RULES
  page1.drawText('2. STRICT OPERATIONAL RULES & POLICIES', { x: 36, y, size: 12, font: fontBold, color: navyColor });
  y -= 16;

  const rules = [
    { title: 'RULE 1: NO PASSWORDS IN SYSTEM DROPDOWNS', text: 'Dropdown menus only display the branch and username. Users must always type their password manually to prevent unauthorized access on shared branch terminals.' },
    { title: 'RULE 2: SEPARATION OF DUTIES (SoD)', text: 'The employee who registers a customer or submits a request can NEVER approve that request or execute payment. Approvals require independent Manager or Mr. Sanjay signoff.' },
    { title: 'RULE 3: SINGLE DECISION LOCK', text: 'Once either the Manager or Mr. Sanjay approves or rejects a request, the decision is permanently locked. Duplicate conflicting decisions are strictly prevented by the database.' },
    { title: 'RULE 4: DIRECT-TO-BANK DISBURSEMENT ONLY', text: 'All approved funds must be transferred directly into the customer’s registered bank account (via CEFT, SLIPS, RTGS, or Internal Bank Transfer). Funds are never given as unbacked cash.' },
    { title: 'RULE 5: MANDATORY RECEIPT UPLOAD & AUDIT LOGGING', text: 'No transfer is considered complete without an uploaded bank payment receipt advice (PDF or image). Every action records actor, IP, date, and exact time down to the second.' },
  ];

  rules.forEach((r) => {
    page1.drawRectangle({
      x: 36,
      y: y - 32,
      width: width - 72,
      height: 32,
      color: cardBg,
      borderColor: borderGray,
      borderWidth: 0.5,
    });
    page1.drawText(r.title, { x: 44, y: y - 13, size: 8, font: fontBold, color: navyColor });
    page1.drawText(r.text, { x: 44, y: y - 24, size: 7.2, font: fontRegular, color: darkGray });
    y -= 36;
  });

  // Footer Page 1
  page1.drawLine({ start: { x: 36, y: 35 }, end: { x: width - 36, y: 35 }, thickness: 1, color: borderGray });
  page1.drawText('COMPANY FINANCE • SYSTEM OPERATIONAL USER GUIDE', { x: 36, y: 22, size: 7.5, font: fontBold, color: mutedGray });
  page1.drawText('Page 1 of 2', { x: width - 80, y: 22, size: 7.5, font: fontRegular, color: mutedGray });

  // ================= PAGE 2: 7-STEP WORKFLOW WALKTHROUGH =================
  const page2 = pdfDoc.addPage([595.28, 841.89]);

  // Header Banner Page 2
  page2.drawRectangle({
    x: 0,
    y: height - 60,
    width: width,
    height: 60,
    color: navyColor,
  });

  page2.drawText('COMPANY FINANCE — 7-STEP OPERATIONAL FLOW & AUDIT LEDGER', {
    x: 36,
    y: height - 38,
    size: 14,
    font: fontBold,
    color: white,
  });

  let y2 = height - 85;

  const steps = [
    {
      num: 'STEP 1',
      title: 'Branch Login & Role Authentication',
      actor: 'Employee / Manager / Admin',
      desc: 'Users open the web portal (https://cashmanagement-system.vercel.app), select their branch or role, and type their unique enterprise password. The interface loads role-permitted workspace features exclusively.',
    },
    {
      num: 'STEP 2',
      title: 'Customer Registration & KYC Verification',
      actor: 'Branch Employee',
      desc: 'The branch staff navigates to Customers -> Register Customer. They input full customer name, national identity card (NIC), residential address, contact number, bank name, branch, and account number. NIC duplicates are strictly blocked.',
    },
    {
      num: 'STEP 3',
      title: 'Create Interbranch Transfer Request',
      actor: 'Branch Employee',
      desc: 'The employee clicks "+ New Transfer Request", selects the registered customer, chooses any configured funding branch (e.g. Head Office, Borella, Dehiwela), enters the transfer amount and operational reason, then submits.',
    },
    {
      num: 'STEP 4',
      title: 'Dual Approval Inbox (Manager or Mr. Sanjay)',
      actor: 'Manager or Mr. Sanjay',
      desc: 'Both the Manager and Mr. Sanjay receive the pending request simultaneously. Either authorized approver can approve or reject with comments. Only the first decision is accepted; subsequent duplicate actions are locked.',
    },
    {
      num: 'STEP 5',
      title: 'Direct Bank Payment Execution',
      actor: 'Manager / Treasury',
      desc: 'Once approved, the responsible officer transfers funds directly to the customer’s registered bank account via LankaPay CEFT, SLIPS, RTGS, or Internal Bank Transfer, recording the bank transaction reference number.',
    },
    {
      num: 'STEP 6',
      title: 'Upload Official Payment Receipt Advice',
      actor: 'Manager / Treasury',
      desc: 'The officer attaches the electronic confirmation slip or scanned receipt advice (PDF, PNG, or JPG) directly into the transaction record. The request updates to "Payment Submitted — Awaiting Verification".',
    },
    {
      num: 'STEP 7',
      title: 'Receipt Confirmation & History Audit Ledger',
      actor: 'All Roles (Scope-Enforced)',
      desc: 'Branch staff can inspect and download the verified receipt for their customer. Managers and Mr. Sanjay verify matching bank settlement references. Complete date, time, actor, and status details are permanently archived in the History tab.',
    },
  ];

  steps.forEach((s) => {
    page2.drawRectangle({
      x: 36,
      y: y2 - 62,
      width: width - 72,
      height: 62,
      color: white,
      borderColor: borderGray,
      borderWidth: 1,
    });

    // Step badge
    page2.drawRectangle({
      x: 44,
      y: y2 - 22,
      width: 48,
      height: 15,
      color: tealColor,
    });
    page2.drawText(s.num, { x: 50, y: y2 - 18, size: 7.5, font: fontBold, color: white });

    page2.drawText(s.title, { x: 100, y: y2 - 18, size: 9, font: fontBold, color: navyColor });
    page2.drawText(`Actor: ${s.actor}`, { x: width - 210, y: y2 - 18, size: 7.5, font: fontBold, color: amberColor });

    page2.drawText(s.desc, { x: 44, y: y2 - 38, size: 7.8, font: fontRegular, color: darkGray });
    y2 -= 72;
  });

  y2 -= 10;

  // Device Compatibility Box
  page2.drawRectangle({
    x: 36,
    y: y2 - 75,
    width: width - 72,
    height: 75,
    color: lightBg,
    borderColor: tealColor,
    borderWidth: 1,
  });

  page2.drawText('CROSS-DEVICE RESPONSIVENESS (DESKTOP, TABLET & MOBILE PHONE):', { x: 46, y: y2 - 16, size: 8.5, font: fontBold, color: tealColor });
  page2.drawText('• Desktop PC / Laptop: Permanent docked navy sidebar, 4-metric KPIs, and fast data grid tables.', { x: 46, y: y2 - 30, size: 7.8, font: fontRegular, color: darkGray });
  page2.drawText('• Tablet / iPad: Adaptive command bars, responsive drawer sidebar toggleable via header menu button.', { x: 46, y: y2 - 42, size: 7.8, font: fontRegular, color: darkGray });
  page2.drawText('• Mobile Phone: Vertically stacked login canvas, touch-optimized dialogs, and horizontal scrolling ledger tables.', { x: 46, y: y2 - 54, size: 7.8, font: fontRegular, color: darkGray });
  page2.drawText('• Online Production URL: https://cashmanagement-system.vercel.app', { x: 46, y: y2 - 66, size: 7.8, font: fontBold, color: navyColor });

  // Footer Page 2
  page2.drawLine({ start: { x: 36, y: 35 }, end: { x: width - 36, y: 35 }, thickness: 1, color: borderGray });
  page2.drawText('COMPANY FINANCE • SYSTEM OPERATIONAL USER GUIDE', { x: 36, y: 22, size: 7.5, font: fontBold, color: mutedGray });
  page2.drawText('Page 2 of 2', { x: width - 80, y: 22, size: 7.5, font: fontRegular, color: mutedGray });

  const pdfBytes = await pdfDoc.save();

  const outputPath = path.resolve('c:/Users/Aurum/cash management/SYSTEM_USER_GUIDE_AND_RULES.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Generated User Guide PDF at: ${outputPath}`);

  const artifactDir = 'C:/Users/Aurum/.gemini/antigravity-ide/brain/97444b50-a373-434e-933c-bc2b0b380053';
  if (fs.existsSync(artifactDir)) {
    fs.writeFileSync(path.join(artifactDir, 'SYSTEM_USER_GUIDE_AND_RULES.pdf'), pdfBytes);
  }
}

generateUserGuidePdf().catch(console.error);
