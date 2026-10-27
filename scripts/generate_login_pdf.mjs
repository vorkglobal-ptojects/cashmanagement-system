import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateCredentialsPdf() {
  const pdfDoc = await PDFDocument.create();

  // Primary colors matching brand
  const navyColor = rgb(19 / 255, 38 / 255, 68 / 255);       // #132644
  const tealColor = rgb(8 / 255, 127 / 255, 112 / 255);      // #087f70
  const lightBg = rgb(244 / 255, 246 / 255, 249 / 255);      // #f4f6f9
  const darkGray = rgb(30 / 255, 41 / 255, 59 / 255);       // #1e293b
  const mutedGray = rgb(100 / 255, 116 / 255, 139 / 255);   // #64748b
  const borderGray = rgb(226 / 255, 232 / 255, 240 / 255);  // #e2e8f0
  const white = rgb(1, 1, 1);
  const codeBg = rgb(238 / 255, 242 / 255, 246 / 255);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // --- PAGE 1: Executive Summary & All User Credentials ---
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 Size in points
  const { width, height } = page.getSize();

  // Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: navyColor,
  });

  page.drawText('COMPANY FINANCE', {
    x: 36,
    y: height - 42,
    size: 20,
    font: fontBold,
    color: white,
  });

  page.drawText('CENTRALIZED BRANCH CASH MANAGEMENT & REQUEST APPROVAL SYSTEM', {
    x: 36,
    y: height - 60,
    size: 9,
    font: fontBold,
    color: tealColor,
  });

  page.drawText('OFFICIAL CREDENTIALS & ACCESS DIRECTORY', {
    x: 36,
    y: height - 78,
    size: 9,
    font: fontRegular,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  // System URL Callout Box
  page.drawRectangle({
    x: 36,
    y: height - 150,
    width: width - 72,
    height: 38,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('Web Application Access URL:', {
    x: 48,
    y: height - 134,
    size: 10,
    font: fontBold,
    color: darkGray,
  });

  page.drawText('http://localhost:3000', {
    x: 215,
    y: height - 134,
    size: 10,
    font: fontMono,
    color: tealColor,
  });

  page.drawText('Universal Default Password:', {
    x: 345,
    y: height - 134,
    size: 10,
    font: fontBold,
    color: darkGray,
  });

  page.drawText('Admin@123', {
    x: 495,
    y: height - 134,
    size: 10,
    font: fontMono,
    color: rgb(180 / 255, 83 / 255, 9 / 255),
  });

  // Section 1: Administrator Credentials
  let yPos = height - 175;
  page.drawText('1. EXECUTIVE & SYSTEM ADMINISTRATORS', {
    x: 36,
    y: yPos,
    size: 11,
    font: fontBold,
    color: navyColor,
  });

  yPos -= 18;

  const adminUsers = [
    {
      role: 'Main Administrator',
      name: 'Mr. Sanjay Sharma',
      username: 'sanjay',
      pass: 'Admin@123',
      branch: 'Head Office (All 11 Branches)',
      desc: 'Company-wide oversight across all 11 branches, approval authority, audit ledger.',
    },
    {
      role: 'System Administrator',
      name: 'Admin User',
      username: 'admin',
      pass: 'Admin@123',
      branch: 'Head Office (All Branches)',
      desc: 'Branch management, user provisioning, database configuration, security audit.',
    },
  ];

  adminUsers.forEach((u) => {
    page.drawRectangle({
      x: 36,
      y: yPos - 38,
      width: width - 72,
      height: 36,
      color: white,
      borderColor: borderGray,
      borderWidth: 1,
    });

    page.drawText(`${u.name} (${u.role})`, {
      x: 46,
      y: yPos - 14,
      size: 9.5,
      font: fontBold,
      color: darkGray,
    });

    page.drawText(`Username: `, { x: 46, y: yPos - 28, size: 8.5, font: fontRegular, color: mutedGray });
    page.drawText(u.username, { x: 98, y: yPos - 28, size: 8.5, font: fontMono, color: navyColor });

    page.drawText(`Password: `, { x: 180, y: yPos - 28, size: 8.5, font: fontRegular, color: mutedGray });
    page.drawText(u.pass, { x: 230, y: yPos - 28, size: 8.5, font: fontMono, color: navyColor });

    page.drawText(`Scope: ${u.branch}`, { x: 320, y: yPos - 28, size: 8, font: fontRegular, color: tealColor });

    yPos -= 42;
  });

  // Section 2: Branch Managers (Cross-Branch Visibility)
  yPos -= 10;
  page.drawText('2. BRANCH MANAGERS (Cross-Branch Visibility & Approval Authority)', {
    x: 36,
    y: yPos,
    size: 11,
    font: fontBold,
    color: navyColor,
  });

  yPos -= 18;

  const managerUsers = [
    { name: 'Dhammika Senanayake', branch: 'Borella (BR-002)', username: 'manager_borella', pass: 'Admin@123' },
    { name: 'Chamari Wickramasinghe', branch: 'Head Office (HQ-001)', username: 'manager_office', pass: 'Admin@123' },
    { name: 'Sunil Fernandopulle', branch: 'SUPER Regional Vault', username: 'manager_super', pass: 'Admin@123' },
    { name: 'Ruwan Jayawardena', branch: 'Dehiwela (BR-003)', username: 'manager_dehiwela', pass: 'Admin@123' },
  ];

  managerUsers.forEach((u) => {
    page.drawRectangle({
      x: 36,
      y: yPos - 34,
      width: width - 72,
      height: 32,
      color: white,
      borderColor: borderGray,
      borderWidth: 1,
    });

    page.drawText(`${u.name} — Branch Manager`, { x: 46, y: yPos - 13, size: 9, font: fontBold, color: darkGray });
    page.drawText(u.branch, { x: 350, y: yPos - 13, size: 8.5, font: fontBold, color: tealColor });

    page.drawText(`Username: `, { x: 46, y: yPos - 26, size: 8.5, font: fontRegular, color: mutedGray });
    page.drawText(u.username, { x: 98, y: yPos - 26, size: 8.5, font: fontMono, color: navyColor });

    page.drawText(`Password: `, { x: 230, y: yPos - 26, size: 8.5, font: fontRegular, color: mutedGray });
    page.drawText(u.pass, { x: 280, y: yPos - 26, size: 8.5, font: fontMono, color: navyColor });

    yPos -= 38;
  });

  // Section 3: Branch Employees (Customer Registration & Request Creation)
  yPos -= 10;
  page.drawText('3. BRANCH EMPLOYEES (Customer Registration & Transfer Requests)', {
    x: 36,
    y: yPos,
    size: 11,
    font: fontBold,
    color: navyColor,
  });

  yPos -= 18;

  const employeeUsers = [
    { name: 'Kavindi Silva', empId: 'EMP-102', branch: 'Borella (BR-002)', username: 'employee_borella', pass: 'Admin@123' },
    { name: 'Niroshan Bandara', empId: 'EMP-103', branch: 'Dehiwela (BR-003)', username: 'employee_dehiwela', pass: 'Admin@123' },
    { name: 'Saman Kumara', empId: 'EMP-104', branch: 'Homagama (BR-005)', username: 'employee_homagama', pass: 'Admin@123' },
    { name: 'Dilani Rodrigo', empId: 'EMP-105', branch: 'Panadura (BR-009)', username: 'employee_panadura', pass: 'Admin@123' },
  ];

  employeeUsers.forEach((u) => {
    page.drawRectangle({
      x: 36,
      y: yPos - 34,
      width: width - 72,
      height: 32,
      color: white,
      borderColor: borderGray,
      borderWidth: 1,
    });

    page.drawText(`${u.name} (${u.empId}) — Branch Employee`, { x: 46, y: yPos - 13, size: 9, font: fontBold, color: darkGray });
    page.drawText(u.branch, { x: 350, y: yPos - 13, size: 8.5, font: fontBold, color: tealColor });

    page.drawText(`Username: `, { x: 46, y: yPos - 26, size: 8.5, font: fontRegular, color: mutedGray });
    page.drawText(u.username, { x: 98, y: yPos - 26, size: 8.5, font: fontMono, color: navyColor });

    page.drawText(`Password: `, { x: 230, y: yPos - 26, size: 8.5, font: fontRegular, color: mutedGray });
    page.drawText(u.pass, { x: 280, y: yPos - 26, size: 8.5, font: fontMono, color: navyColor });

    yPos -= 38;
  });

  // Footer Page 1
  page.drawLine({
    start: { x: 36, y: 35 },
    end: { x: width - 36, y: 35 },
    thickness: 1,
    color: borderGray,
  });

  page.drawText('CONFIDENTIAL & PROPRIETARY — STRICT INTERNAL USE ONLY', {
    x: 36,
    y: 22,
    size: 7.5,
    font: fontBold,
    color: mutedGray,
  });

  page.drawText('Page 1 of 2', {
    x: width - 80,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: mutedGray,
  });

  // --- PAGE 2: Branch Network & Standard Operating Workflow ---
  page = pdfDoc.addPage([595.28, 841.89]);

  // Header Banner Page 2
  page.drawRectangle({
    x: 0,
    y: height - 70,
    width: width,
    height: 70,
    color: navyColor,
  });

  page.drawText('BRANCH NETWORK & STANDARD OPERATING PROCEDURES', {
    x: 36,
    y: height - 42,
    size: 14,
    font: fontBold,
    color: white,
  });

  page.drawText('ALL 11 CONFIGURED BRANCHES & WORKFLOW RESPONSIBILITIES', {
    x: 36,
    y: height - 57,
    size: 8.5,
    font: fontBold,
    color: tealColor,
  });

  yPos = height - 95;

  page.drawText('4. CONFIGURED COMPANY BRANCHES (11 Operating Branches + 1 Regional Hub)', {
    x: 36,
    y: yPos,
    size: 10.5,
    font: fontBold,
    color: navyColor,
  });

  yPos -= 16;

  const branchList = [
    { code: 'HQ-001', id: 'OFFICE', name: 'Head Office', city: 'Colombo 03' },
    { code: 'BR-002', id: 'BRL', name: 'Borella', city: 'Colombo 08' },
    { code: 'BR-003', id: 'DEH', name: 'Dehiwela', city: 'Dehiwela' },
    { code: 'BR-004', id: 'DEM', name: 'Dematagoda', city: 'Colombo 09' },
    { code: 'BR-005', id: 'HOM', name: 'Homagama', city: 'Homagama' },
    { code: 'BR-006', id: 'KAD', name: 'Kadawatha', city: 'Kadawatha' },
    { code: 'BR-007', id: 'KIR', name: 'Kiribathgoda', city: 'Kiribathgoda' },
    { code: 'BR-008', id: 'KOT', name: 'Kottawa', city: 'Kottawa' },
    { code: 'BR-009', id: 'PAN', name: 'Panadura', city: 'Panadura' },
    { code: 'BR-010', id: 'W3', name: 'W3', city: 'Colombo West 03' },
    { code: 'BR-011', id: 'W4', name: 'W4', city: 'Colombo West 04' },
    { code: 'SUPER-01', id: 'SUPER', name: 'SUPER Branch', city: 'Colombo Central' },
  ];

  // 2-column table for branches
  const colWidth = (width - 72 - 12) / 2;
  for (let i = 0; i < branchList.length; i += 2) {
    const b1 = branchList[i];
    const b2 = branchList[i + 1];

    page.drawRectangle({
      x: 36,
      y: yPos - 22,
      width: colWidth,
      height: 20,
      color: lightBg,
      borderColor: borderGray,
      borderWidth: 0.5,
    });
    page.drawText(`${b1.code} • ${b1.name}`, { x: 42, y: yPos - 15, size: 8, font: fontBold, color: darkGray });
    page.drawText(b1.city, { x: 195, y: yPos - 15, size: 7.5, font: fontRegular, color: mutedGray });

    if (b2) {
      page.drawRectangle({
        x: 36 + colWidth + 12,
        y: yPos - 22,
        width: colWidth,
        height: 20,
        color: lightBg,
        borderColor: borderGray,
        borderWidth: 0.5,
      });
      page.drawText(`${b2.code} • ${b2.name}`, { x: 36 + colWidth + 18, y: yPos - 15, size: 8, font: fontBold, color: darkGray });
      page.drawText(b2.city, { x: 36 + colWidth + 175, y: yPos - 15, size: 7.5, font: fontRegular, color: mutedGray });
    }

    yPos -= 24;
  }

  yPos -= 12;

  // Section 5: Standard Operating Workflows
  page.drawText('5. STANDARD OPERATING WORKFLOWS & ACCESS CONTROL RULES', {
    x: 36,
    y: yPos,
    size: 10.5,
    font: fontBold,
    color: navyColor,
  });

  yPos -= 16;

  const workflows = [
    {
      title: 'A. Employee Workflow (Customer KYC & Fund Transfer Submission)',
      steps: [
        '1. Login using individual credentials (e.g. employee_borella / Admin@123).',
        '2. Customer Registration: Enter Full Name, validated NIC (with instant duplicate detection), Address, Phone, and confidential Bank Account details.',
        '3. Transfer Request: Select customer, requested amount, purpose, and choose ANY branch as funding branch.',
        '4. Tracking & Verification: Track submitted request through 7 live statuses and view manager uploaded receipt & medical form.',
        '* Strictly enforced rule: Employees cannot approve their own requests.',
      ],
    },
    {
      title: 'B. Branch Manager Workflow (Approvals & Document Uploads)',
      steps: [
        '1. Login using manager credentials (e.g. manager_borella / Admin@123). Cross-branch visibility is automatically active.',
        '2. Review queue of requests submitted across all 11 branches with employee ID, branch, customer, and amount.',
        '3. Execute 1-click Approve or Reject with comments (system blocks conflicting duplicate decisions).',
        '4. Direct Bank Payment: Execute payment and record transaction reference (CEFT, SLIPS, RTGS).',
        '5. Upload Receipt & Medical Form: Attach signed medical form and payment receipt advice to the request.',
        '* Managers do NOT register customers (maintained by employees).',
      ],
    },
    {
      title: 'C. Mr. Sanjay Sharma — Main Administrator (Company-Wide Oversight)',
      steps: [
        '1. Login as sanjay / Admin@123. Full oversight across all 11 branches, all employees, customers, and transactions.',
        '2. Direct approval authority over any branch request.',
        '3. Interactive Document Viewer: Inspect both uploaded medical forms and payment receipts side-by-side.',
        '4. Access consolidated financial reports, liquidity distributions, and tamper-evident audit history.',
      ],
    },
  ];

  workflows.forEach((wf) => {
    page.drawText(wf.title, { x: 36, y: yPos, size: 9, font: fontBold, color: navyColor });
    yPos -= 12;

    wf.steps.forEach((step) => {
      page.drawText(step, { x: 44, y: yPos, size: 8, font: fontRegular, color: step.startsWith('*') ? rgb(180 / 255, 83 / 255, 9 / 255) : darkGray });
      yPos -= 11;
    });

    yPos -= 6;
  });

  // Footer Page 2
  page.drawLine({
    start: { x: 36, y: 35 },
    end: { x: width - 36, y: 35 },
    thickness: 1,
    color: borderGray,
  });

  page.drawText('CONFIDENTIAL & PROPRIETARY — STRICT INTERNAL USE ONLY', {
    x: 36,
    y: 22,
    size: 7.5,
    font: fontBold,
    color: mutedGray,
  });

  page.drawText('Page 2 of 2', {
    x: width - 80,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: mutedGray,
  });

  const pdfBytes = await pdfDoc.save();

  // Save to workspace root
  const outputPath = path.resolve('c:/Users/Aurum/cash management/BRANCH_MANAGEMENT_LOGINS_AND_PASSWORDS.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Successfully generated PDF at: ${outputPath} (${pdfBytes.length} bytes)`);

  // Also save to artifact directory
  const artifactDir = 'C:/Users/Aurum/.gemini/antigravity-ide/brain/97444b50-a373-434e-933c-bc2b0b380053';
  if (fs.existsSync(artifactDir)) {
    const artifactPdfPath = path.join(artifactDir, 'BRANCH_MANAGEMENT_LOGINS_AND_PASSWORDS.pdf');
    fs.writeFileSync(artifactPdfPath, pdfBytes);
    console.log(`Copied PDF to artifact dir: ${artifactPdfPath}`);
  }
}

generateCredentialsPdf().catch(console.error);
