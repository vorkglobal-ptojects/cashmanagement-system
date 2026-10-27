import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { maskNic, maskBankAccount } from '@/lib/masking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  const { id } = await params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        registeringBranch: {
          select: { id: true, name: true, code: true, city: true },
        },
        fundTransfers: {
          orderBy: { createdAt: 'desc' },
          include: {
            requestingBranch: {
              select: { id: true, name: true, code: true },
            },
            fundingBranch: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const canViewUnmasked =
      session!.role === 'MAIN_ADMIN' ||
      session!.role === 'SYSTEM_ADMIN' ||
      session!.role === 'BRANCH_MANAGER';

    const formatted = {
      ...customer,
      nicNumber: canViewUnmasked ? customer.nicNumber : maskNic(customer.nicNumber),
      bankAccountNumber: canViewUnmasked ? customer.bankAccountNumber : maskBankAccount(customer.bankAccountNumber),
      rawNic: canViewUnmasked ? customer.nicNumber : undefined,
      rawBankAccount: canViewUnmasked ? customer.bankAccountNumber : undefined,
    };

    return NextResponse.json({ customer: formatted });
  } catch (err: any) {
    console.error('Error fetching customer profile:', err);
    return NextResponse.json({ error: 'Failed to retrieve customer' }, { status: 500 });
  }
}
