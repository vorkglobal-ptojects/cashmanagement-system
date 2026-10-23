import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, generateSessionToken, setSessionCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { UserRole } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username/email and password are required' }, { status: 400 });
    }

    const trimmed = identifier.trim().toLowerCase();

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: trimmed }, { email: trimmed }],
      },
      include: {
        branch: true,
      },
    });

    if (!user || !user.isActive) {
      await logAuditEvent({
        action: 'AUTH_LOGIN_FAILED',
        resource: 'User',
        details: { identifier: trimmed, reason: 'User not found or inactive' },
        status: 'FAILURE',
      });
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const passwordValid = await comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      await logAuditEvent({
        session: {
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.role as UserRole,
          branchId: user.branchId,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        action: 'AUTH_LOGIN_FAILED',
        resource: 'User',
        resourceId: user.id,
        details: { reason: 'Incorrect password' },
        status: 'FAILURE',
      });
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const sessionPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role as UserRole,
      branchId: user.branchId,
      branchName: user.branch?.name,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = generateSessionToken(sessionPayload);

    await logAuditEvent({
      session: sessionPayload,
      action: 'AUTH_LOGIN_SUCCESS',
      resource: 'User',
      resourceId: user.id,
      details: { role: user.role, branchId: user.branchId },
      status: 'SUCCESS',
    });

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      token,
    });

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
