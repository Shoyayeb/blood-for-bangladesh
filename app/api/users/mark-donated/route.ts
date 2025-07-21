import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    const { location, notes } = await request.json();

    // Update user's donation status
    const updatedUser = await prisma.user.update({
      where: { id: verificationResult.uid },
      data: {
        lastDonationDate: new Date(),
        isDonationPaused: true, // Start 3-month cooldown
      },
    });

    // Create a donation record
    await prisma.donation.create({
      data: {
        userId: verificationResult.uid!,
        location: location || 'Self-reported',
        notes: notes || 'Self-reported donation',
      },
    });

    return NextResponse.json({
      message: 'Thank you for donating! You are now in a 3-month donation cooldown period.',
      user: {
        id: updatedUser.id,
        lastDonationDate: updatedUser.lastDonationDate,
        isDonationPaused: updatedUser.isDonationPaused,
      },
    });

  } catch (error) {
    console.error('Error marking donation:', error);
    return NextResponse.json(
      { error: 'Failed to record donation' },
      { status: 500 }
    );
  }
}

// GET endpoint to check donation status
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
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

    const user = await prisma.user.findUnique({
      where: { id: verificationResult.uid },
      select: {
        id: true,
        lastDonationDate: true,
        isDonationPaused: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if 3 months have passed since last donation
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days

    let canDonate = true;
    let daysUntilCanDonate = 0;

    if (user.lastDonationDate && user.isDonationPaused) {
      const daysSinceLastDonation = Math.floor((now.getTime() - user.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastDonation < 90) {
        canDonate = false;
        daysUntilCanDonate = 90 - daysSinceLastDonation;
      } else {
        // Auto-reset donation pause if 3 months have passed
        await prisma.user.update({
          where: { id: verificationResult.uid },
          data: {
            isDonationPaused: false,
          },
        });
      }
    }

    return NextResponse.json({
      canDonate,
      daysUntilCanDonate,
      lastDonationDate: user.lastDonationDate,
      isDonationPaused: user.isDonationPaused,
    });

  } catch (error) {
    console.error('Error checking donation status:', error);
    return NextResponse.json(
      { error: 'Failed to check donation status' },
      { status: 500 }
    );
  }
}
