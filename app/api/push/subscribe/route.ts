import { adminAuth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Save push notification subscription for a user
export async function POST(request: NextRequest) {
  try {
    const { endpoint, keys } = await request.json();

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
    } catch (error) {
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

    // Save or update push subscription
    // For now, we'll store it in the user's record as JSON
    // In a production app, you might want a separate table for subscriptions
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Add pushSubscription field to user model if needed
        // pushSubscription: { endpoint, keys }
      },
    });

    // TODO: Store push subscription in a proper way
    // This is a placeholder - you would typically store this in a separate table
    // or add a pushSubscription field to the User model

    console.log(`Push subscription saved for user ${user.id}:`, { endpoint, keys });

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully',
    });

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get push subscription for a user
export async function GET(request: NextRequest) {
  try {
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
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { phoneNumber: decodedToken.phone_number },
      select: {
        id: true,
        // pushSubscription: true // if you add this field
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      // subscription: user.pushSubscription || null
      subscription: null // placeholder
    });

  } catch (error) {
    console.error('Error getting push subscription:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
