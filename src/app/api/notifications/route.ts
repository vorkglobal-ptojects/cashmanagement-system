import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  try {
    const where: any = {
      OR: [
        { recipientUserId: session!.userId },
        { recipientRole: session!.role },
      ],
    };

    if (session!.branchId) {
      where.OR.push({ recipientBranchId: session!.branchId });
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, response } = requireAuth(request);
  if (response) return response;

  try {
    const body = await request.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { recipientUserId: session!.userId },
            { recipientRole: session!.role },
          ],
        },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Missing notification id' }, { status: 400 });
  } catch (err: any) {
    console.error('Error marking notification read:', err);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
