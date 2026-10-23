import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getSessionFromRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (session) {
    await logAuditEvent({
      session,
      action: 'AUTH_LOGOUT',
      resource: 'User',
      resourceId: session.userId,
      details: { message: 'User logged out' },
      status: 'SUCCESS',
    });
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearSessionCookie(response);
  return response;
}
