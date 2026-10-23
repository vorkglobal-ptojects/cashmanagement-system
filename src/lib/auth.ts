import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { AuthSession, UserRole } from './types';

const SESSION_COOKIE_NAME = 'cms_session';
const SECRET_KEY = process.env.SESSION_SECRET || 'cms-super-secure-production-secret-key-32-chars-long-minimum-9988';

/**
 * Hash password with bcrypt salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create HMAC signature for a payload string
 */
function signPayload(payloadStr: string): string {
  return crypto.createHmac('sha256', SECRET_KEY).update(payloadStr).digest('hex');
}

/**
 * Generate a cryptographically signed session token
 */
export function generateSessionToken(session: AuthSession): string {
  const payloadStr = JSON.stringify({
    ...session,
    exp: Date.now() + 1000 * 60 * 60 * 12, // 12-hour session
  });
  const encodedPayload = Buffer.from(payloadStr, 'utf-8').toString('base64url');
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): AuthSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSig = signPayload(encodedPayload);

    // Constant-time comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      return null;
    }

    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const data = JSON.parse(payloadStr);

    if (!data.exp || data.exp < Date.now()) {
      return null; // Expired
    }

    return {
      userId: data.userId,
      username: data.username,
      email: data.email,
      role: data.role as UserRole,
      branchId: data.branchId || null,
      branchName: data.branchName,
      firstName: data.firstName,
      lastName: data.lastName,
    };
  } catch {
    return null;
  }
}

/**
 * Extract authenticated session from incoming request
 */
export function getSessionFromRequest(request: NextRequest): AuthSession | null {
  // Check HTTP-only cookie first
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) {
    const session = verifySessionToken(cookie.value);
    if (session) return session;
  }

  // Fallback to Bearer token header if provided
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    return verifySessionToken(token);
  }

  return null;
}

/**
 * Set HTTP-Only session cookie in response
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

/**
 * Clear session cookie on logout
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Require valid session or return 401 Unauthorized
 */
export function requireAuth(request: NextRequest): { session?: AuthSession; response?: NextResponse } {
  const session = getSessionFromRequest(request);
  if (!session) {
    return {
      response: NextResponse.json({ error: 'Unauthorized: Valid session required' }, { status: 401 }),
    };
  }
  return { session };
}

/**
 * Require specific roles or return 403 Forbidden
 */
export function requireRole(
  session: AuthSession,
  allowedRoles: UserRole[]
): { allowed: boolean; response?: NextResponse } {
  if (!allowedRoles.includes(session.role)) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: `Forbidden: Role '${session.role}' is not authorized for this operation` },
        { status: 403 }
      ),
    };
  }
  return { allowed: true };
}

/**
 * Validate that a user has authorized branch scope
 * Head Office & System Admins have multi-branch access
 */
export function validateBranchScope(session: AuthSession, targetBranchId?: string | null): boolean {
  if (session.role === 'SYSTEM_ADMIN' || session.role === 'FINANCE_ADMIN' || session.role === 'AUDITOR') {
    return true; // Consolidated organization-wide visibility
  }
  if (!targetBranchId) return true;
  return session.branchId === targetBranchId;
}
