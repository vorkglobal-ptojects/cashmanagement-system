import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;

  const session = auth.session!;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { branch: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'User account disabled or not found' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      branchName: user.branch?.name,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
}
