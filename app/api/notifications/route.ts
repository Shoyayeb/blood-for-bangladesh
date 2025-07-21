import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    const verificationResult = await verifyFirebaseToken(token);
    
    if (!verificationResult.success) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const phoneNumber = verificationResult.phoneNumber;

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get notifications for this user
    const notifications = await prisma.notification.findMany({
      where: {
        donorId: user.id,
      },
      include: {
        bloodRequest: true,
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: 50, // Limit to recent 50 notifications
    });

    // Format notifications for frontend
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      bloodRequest: {
        id: notification.bloodRequest.id,
        requesterName: notification.bloodRequest.requesterName,
        requesterPhone: notification.bloodRequest.requesterPhone,
        bloodGroup: notification.bloodRequest.bloodGroup,
        urgency: notification.bloodRequest.urgency.toLowerCase(),
        location: notification.bloodRequest.location,
        hospital: notification.bloodRequest.hospitalData ? JSON.parse(notification.bloodRequest.hospitalData as string) : null,
        message: notification.bloodRequest.message,
        createdAt: notification.bloodRequest.createdAt.toISOString(),
        requesterCity: notification.bloodRequest.requesterCity,
        requesterState: notification.bloodRequest.requesterState,
      },
      sentAt: notification.sentAt.toISOString(),
      readAt: notification.readAt?.toISOString(),
      respondedAt: notification.respondedAt?.toISOString(),
      response: notification.response,
    }));

    return NextResponse.json({
      notifications: formattedNotifications,
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
