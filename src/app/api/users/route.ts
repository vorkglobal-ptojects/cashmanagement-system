import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, hashPassword } from '@/lib/auth';
import { recordAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  try {
    const users = await prisma.user.findMany({
      include: {
        branch: {
          select: { id: true, name: true, code: true, city: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      branchId: u.branchId,
      branchName: u.branch?.name || 'Head Office (Consolidated)',
      isActive: u.isActive,
      phone: u.phone,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  if (session!.role !== 'MAIN_ADMIN' && session!.role !== 'SYSTEM_ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Only Main Administrator (Mr. Sanjay) can provision employees and managers.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { username, email, password, firstName, lastName, role, branchId, phone } = body;

    if (!username || !email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Username, Email, Password, First Name, Last Name, and Role are required.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existing) {
      return NextResponse.json({ error: 'Username or email already in use.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        branchId: branchId || null,
        phone: phone ? phone.trim() : null,
        isActive: true,
      },
      include: {
        branch: true,
      },
    });

    await recordAuditEvent({
      userId: session!.userId,
      username: session!.username,
      role: session!.role,
      branchId: branchId || 'OFFICE',
      action: 'USER_CREATED',
      resource: 'User',
      resourceId: newUser.id,
      details: { username: newUser.username, role: newUser.role, branch: newUser.branch?.name },
      status: 'SUCCESS',
    });

    return NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        branchId: newUser.branchId,
        isActive: newUser.isActive,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating user:', err);
    return NextResponse.json({ error: err.message || 'Failed to create user' }, { status: 500 });
  }
}
