import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { location, notes } = body;

    // Get user to verify they exist and are active
    const user = await prisma.user.findUnique({
      where: { id: verificationResult.uid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'User account is inactive' }, { status: 400 });
    }

    const now = new Date();

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        userId: user.id,
        donatedAt: now,
        location: location || null,
        notes: notes || null,
      },
    });

    // Update user's donation status - start 3-month cooldown
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastDonationDate: now,
        isDonationPaused: true, // Start 3-month cooldown
      },
      select: {
        id: true,
        name: true,
        bloodGroup: true,
        lastDonationDate: true,
        isDonationPaused: true,
      },
    });

    return NextResponse.json({
      message: 'Donation recorded successfully! You are now in a 3-month donation cooldown period.',
      donation: {
        id: donation.id,
        donatedAt: donation.donatedAt,
        location: donation.location,
        notes: donation.notes,
      },
      user: updatedUser,
    });

  } catch (error) {
    console.error('Donation recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
