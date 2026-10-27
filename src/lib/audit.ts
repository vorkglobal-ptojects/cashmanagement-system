import { prisma } from './db';
import { AuthSession } from './types';

export interface AuditParams {
  session?: AuthSession | null;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown> | string;
  ipAddress?: string;
  status?: 'SUCCESS' | 'FAILURE' | 'REJECTED';
}

/**
 * Record an immutable audit event from session
 */
export async function logAuditEvent({
  session,
  action,
  resource,
  resourceId,
  details,
  ipAddress,
  status = 'SUCCESS',
}: AuditParams) {
  try {
    const detailsString = typeof details === 'string' ? details : JSON.stringify(details);

    await prisma.auditEvent.create({
      data: {
        userId: session?.userId ?? null,
        username: session?.username ?? 'SYSTEM',
        role: session?.role ?? null,
        branchId: session?.branchId ?? null,
        action,
        resource,
        resourceId: resourceId ?? null,
        details: detailsString,
        ipAddress: ipAddress ?? null,
        status,
      },
    });
  } catch (error) {
    console.error('CRITICAL: Failed to write audit event:', error, { action, resource, resourceId });
  }
}

/**
 * Record an audit event with explicit fields
 */
export async function recordAuditEvent(params: {
  userId?: string | null;
  username?: string | null;
  role?: string | null;
  branchId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details: Record<string, unknown> | string;
  ipAddress?: string | null;
  status?: 'SUCCESS' | 'FAILURE' | 'REJECTED';
}) {
  try {
    const detailsString = typeof params.details === 'string' ? params.details : JSON.stringify(params.details);

    await prisma.auditEvent.create({
      data: {
        userId: params.userId ?? null,
        username: params.username ?? 'SYSTEM',
        role: params.role ?? null,
        branchId: params.branchId ?? null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? null,
        details: detailsString,
        ipAddress: params.ipAddress ?? null,
        status: params.status ?? 'SUCCESS',
      },
    });
  } catch (error) {
    console.error('CRITICAL: Failed to write audit event:', error);
  }
}
