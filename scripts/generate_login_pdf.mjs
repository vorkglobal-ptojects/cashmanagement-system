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

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size in points
  const { width, height } = page.getSize();

  // Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width: width,
    height: 90,
    color: navyColor,
  });

  page.drawText('COMPANY FINANCE', {
    x: 36,
    y: height - 38,
    size: 20,
    font: fontBold,
    color: white,
  });

  page.drawText('BRANCH MANAGEMENT & REQUEST APPROVAL SYSTEM — ALL LOGINS', {
    x: 36,
    y: height - 56,
    size: 9.5,
    font: fontBold,
    color: tealColor,
  });

  page.drawText('Web Application URL: http://localhost:3000', {
    x: 36,
    y: height - 74,
    size: 9,
    font: fontRegular,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  let yPos = height - 120;

  // 1. ADMIN LOGINS
  page.drawText('1. SYSTEM ADMINISTRATOR & EXECUTIVE APPROVER', { x: 36, y: yPos, size: 10.5, font: fontBold, color: navyColor });
  yPos -= 15;

  const adminLogins = [
    { title: 'System Admin (admin)', username: 'admin', pass: 'Adm#98Kx$21' },
    { title: 'Executive Approver (Mr. Sanjay)', username: 'sanjay', pass: 'Snj@74Vq#89' },
  ];

  adminLogins.forEach((a) => {
    page.drawRectangle({
      x: 36,
      y: yPos - 22,
      width: width - 72,
      height: 22,
      color: white,
      borderColor: borderGray,
      borderWidth: 1,
    });
    page.drawText(a.title, { x: 46, y: yPos - 15, size: 8.5, font: fontBold, color: darkGray });
    page.drawText('Username: ', { x: 230, y: yPos - 15, size: 8, font: fontRegular, color: mutedGray });
    page.drawText(a.username, { x: 280, y: yPos - 15, size: 8.5, font: fontMono, color: navyColor });
    page.drawText('Password: ', { x: 360, y: yPos - 15, size: 8, font: fontRegular, color: mutedGray });
    page.drawText(a.pass, { x: 415, y: yPos - 15, size: 8.5, font: fontMono, color: rgb(180 / 255, 83 / 255, 9 / 255) });
    yPos -= 26;
  });

  yPos -= 8;

  // 2. MANAGER LOGIN
  page.drawText('2. BRANCH MANAGER (Cross-Branch Review, Approvals & Payments)', { x: 36, y: yPos, size: 10.5, font: fontBold, color: navyColor });
  yPos -= 15;

  page.drawRectangle({
    x: 36,
    y: yPos - 22,
    width: width - 72,
    height: 22,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });
  page.drawText('Central Branch Manager', { x: 46, y: yPos - 15, size: 8.5, font: fontBold, color: darkGray });
  page.drawText('Username: ', { x: 230, y: yPos - 15, size: 8, font: fontRegular, color: mutedGray });
  page.drawText('manager', { x: 280, y: yPos - 15, size: 8.5, font: fontMono, color: navyColor });
  page.drawText('Password: ', { x: 360, y: yPos - 15, size: 8, font: fontRegular, color: mutedGray });
  page.drawText('Mgr$62Tp*44', { x: 415, y: yPos - 15, size: 8.5, font: fontMono, color: rgb(180 / 255, 83 / 255, 9 / 255) });

  yPos -= 34;

  // 3. BRANCH LOGINS
  page.drawText('3. DIRECT BRANCH LOGINS (Unique, Non-Obvious Enterprise Credentials)', { x: 36, y: yPos, size: 10.5, font: fontBold, color: navyColor });
  yPos -= 15;

  const branchLogins = [
    { branch: 'Borella', username: 'borella', pass: 'Bor#83Qm$19' },
    { branch: 'Dehiwela', username: 'dehiwela', pass: 'Deh$47Wk#52' },
    { branch: 'Dematagoda', username: 'dematagoda', pass: 'Dem*91Px#38' },
    { branch: 'Homagama', username: 'homagama', pass: 'Hom#56Yr$71' },
    { branch: 'Kadawatha', username: 'kadawatha', pass: 'Kad$32Tv#84' },
    { branch: 'Kiribathgoda', username: 'kiribathgoda', pass: 'Kir*79Lp#63' },
    { branch: 'Kottawa', username: 'kottawa', pass: 'Kot#41Nx$95' },
    { branch: 'Head Office', username: 'office', pass: 'Off*65Rt#14' },
    { branch: 'Panadura', username: 'panadura', pass: 'Pan$88Qw#27' },
    { branch: 'W3', username: 'w3', pass: 'W3b#72Vz$89' },
    { branch: 'W4', username: 'w4', pass: 'W4p$53Tm#61' },
    { branch: 'Super Branch', username: 'super', pass: 'Sup*94Kx#32' },
  ];

  branchLogins.forEach((b) => {
    page.drawRectangle({
      x: 36,
      y: yPos - 21,
      width: width - 72,
      height: 21,
      color: lightBg,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    page.drawText(`${b.branch} Branch`, { x: 46, y: yPos - 14, size: 8, font: fontBold, color: darkGray });
    page.drawText('Username: ', { x: 230, y: yPos - 14, size: 7.5, font: fontRegular, color: mutedGray });
    page.drawText(b.username, { x: 280, y: yPos - 14, size: 8, font: fontMono, color: navyColor });

    page.drawText('Password: ', { x: 360, y: yPos - 14, size: 7.5, font: fontRegular, color: mutedGray });
    page.drawText(b.pass, { x: 415, y: yPos - 14, size: 8, font: fontMono, color: rgb(180 / 255, 83 / 255, 9 / 255) });

    yPos -= 24;
  });

  yPos -= 10;
  // Summary Notes
  page.drawRectangle({
    x: 36,
    y: yPos - 60,
    width: width - 72,
    height: 60,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('ROLE RESPONSIBILITIES:', { x: 46, y: yPos - 15, size: 8, font: fontBold, color: navyColor });
  page.drawText('• Branch Staff: Register new customers (with NIC check & bank account) and submit transfer requests.', { x: 46, y: yPos - 28, size: 7.5, font: fontRegular, color: darkGray });
  page.drawText('• Manager: Review cross-branch requests, 1-click Approve/Reject, process bank payments, upload receipts.', { x: 46, y: yPos - 40, size: 7.5, font: fontRegular, color: darkGray });
  page.drawText('• Admin: Full company-wide visibility across all 11 branches, approval authority, consolidated reports & audit trail.', { x: 46, y: yPos - 52, size: 7.5, font: fontRegular, color: darkGray });

  // Footer
  page.drawLine({
    start: { x: 36, y: 35 },
    end: { x: width - 36, y: 35 },
    thickness: 1,
    color: borderGray,
  });

  page.drawText('CONFIDENTIAL — COMPANY FINANCE BRANCH MANAGEMENT SYSTEM', {
    x: 36,
    y: 22,
    size: 7.5,
    font: fontBold,
    color: mutedGray,
  });

  page.drawText('Page 1 of 1', {
    x: width - 80,
    y: 22,
    size: 7.5,
    font: fontRegular,
    color: mutedGray,
  });

  const pdfBytes = await pdfDoc.save();

  const outputPath = path.resolve('c:/Users/Aurum/cash management/BRANCH_MANAGEMENT_LOGINS_AND_PASSWORDS.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Generated concise PDF at: ${outputPath}`);

  const artifactDir = 'C:/Users/Aurum/.gemini/antigravity-ide/brain/97444b50-a373-434e-933c-bc2b0b380053';
  if (fs.existsSync(artifactDir)) {
    fs.writeFileSync(path.join(artifactDir, 'BRANCH_MANAGEMENT_LOGINS_AND_PASSWORDS.pdf'), pdfBytes);
  }
}

generateCredentialsPdf().catch(console.error);
