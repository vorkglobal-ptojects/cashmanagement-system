import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { recordAuditEvent } from '@/lib/audit';

import { maskNic, maskBankAccount } from '@/lib/masking';

export async function GET(request: NextRequest) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const branchId = searchParams.get('branchId')?.trim() || '';
  const unmask = searchParams.get('unmask') === 'true';

  try {
    const where: any = {};
    if (branchId && branchId !== 'All') {
      where.registeringBranchId = branchId;
    }

    if (q) {
      where.OR = [
        { id: { contains: q } },
        { fullName: { contains: q } },
        { nicNumber: { contains: q } },
        { phoneNumber: { contains: q } },
        { bankAccountNumber: { contains: q } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        registeringBranch: {
          select: { id: true, name: true, code: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Determine if user has permission to view unmasked details
    const canViewUnmasked =
      unmask &&
      (session!.role === 'MAIN_ADMIN' ||
        session!.role === 'SYSTEM_ADMIN' ||
        session!.role === 'BRANCH_MANAGER');

    const formatted = customers.map((c) => ({
      ...c,
      nicNumber: canViewUnmasked ? c.nicNumber : maskNic(c.nicNumber),
      bankAccountNumber: canViewUnmasked ? c.bankAccountNumber : maskBankAccount(c.bankAccountNumber),
      rawNic: canViewUnmasked ? c.nicNumber : undefined,
      rawBankAccount: canViewUnmasked ? c.bankAccountNumber : undefined,
    }));

    return NextResponse.json({ customers: formatted });
  } catch (err: any) {
    console.error('Error fetching customers:', err);
    return NextResponse.json({ error: 'Failed to retrieve customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  try {
    const body = await request.json();
    const {
      fullName,
      nicNumber,
      address,
      phoneNumber,
      bankName,
      bankBranch,
      bankAccountNumber,
      accountHolderName,
      registeringBranchId,
    } = body;

    // 1. Validate required fields
    if (
      !fullName ||
      !nicNumber ||
      !address ||
      !phoneNumber ||
      !bankName ||
      !bankBranch ||
      !bankAccountNumber ||
      !accountHolderName
    ) {
      return NextResponse.json(
        { error: 'All fields (Full Name, NIC, Address, Phone, Bank, Bank Branch, Account Number, Account Holder) are required' },
        { status: 400 }
      );
    }

    const cleanNic = nicNumber.trim().toUpperCase();

    // 2. Prevent duplicate registrations via NIC
    const existing = await prisma.customer.findUnique({
      where: { nicNumber: cleanNic },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Customer with NIC '${cleanNic}' is already registered (Customer ID: ${existing.id}, Name: ${existing.fullName}). Duplicate registration prevented.` },
        { status: 409 }
      );
    }

    // 3. Generate unique customer ID: CUST-2026-XXXX
    const count = await prisma.customer.count();
    const nextSeq = String(count + 1).padStart(4, '0');
    const customerId = `CUST-2026-${nextSeq}`;

    const effectiveBranchId = registeringBranchId || session!.branchId || 'OFFICE';

    const newCustomer = await prisma.customer.create({
      data: {
        id: customerId,
        fullName: fullName.trim(),
        nicNumber: cleanNic,
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        bankName: bankName.trim(),
        bankBranch: bankBranch.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        registeringUserId: session!.userId,
        registeringBranchId: effectiveBranchId,
        status: 'ACTIVE',
      },
      include: {
        registeringBranch: {
          select: { id: true, name: true, code: true, city: true },
        },
      },
    });

    // Record audit event
    await recordAuditEvent({
      userId: session!.userId,
      username: session!.username,
      role: session!.role,
      branchId: effectiveBranchId,
      action: 'CUSTOMER_REGISTERED',
      resource: 'Customer',
      resourceId: customerId,
      details: {
        fullName: newCustomer.fullName,
        nicNumberMasked: maskNic(newCustomer.nicNumber),
        bank: newCustomer.bankName,
        branch: newCustomer.bankBranch,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({ customer: newCustomer }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating customer:', err);
    return NextResponse.json({ error: err.message || 'Customer registration failed' }, { status: 500 });
  }
}
