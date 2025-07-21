import { adminAuth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { requestId, response } = await request.json();

    // Verify the user's authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { phoneNumber: decodedToken.phone_number },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Find the notification for this user and request
    const notification = await prisma.notification.findFirst({
      where: {
        bloodRequestId: requestId,
        donorId: user.id,
      },
      include: {
        bloodRequest: {
          select: {
            requesterName: true,
            requesterPhone: true,
            bloodGroup: true,
            urgency: true,
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }

    // Update the notification with the response
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        response: response.toUpperCase(),
        respondedAt: new Date(),
        status: 'RESPONDED',
        readAt: notification.readAt || new Date(), // Mark as read if not already
      },
    });

    // TODO: Send notification to requester about donor response
    // This would involve sending a push notification or SMS to the requester
    // informing them that a donor has responded

    return NextResponse.json({
      success: true,
      message: `Response recorded successfully. ${
        response === 'accepted' 
          ? 'The requester will be notified that you can help.' 
          : 'Thank you for your response.'
      }`,
    });

  } catch (error) {
    console.error('Error recording notification response:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
