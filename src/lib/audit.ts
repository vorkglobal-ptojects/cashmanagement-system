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
 * Record an immutable audit event
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
    // Financial audit logs must be recorded; log error to stdout for monitoring
    console.error('CRITICAL: Failed to write audit event:', error, { action, resource, resourceId });
  }
}
