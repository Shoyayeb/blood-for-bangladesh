import { prisma } from '@/lib/prisma';
import { calculateAvailableFrom } from '@/lib/utils-donation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Verify Firebase token and get user ID
    // For now, we'll get user ID from request body
    const body = await request.json();
    const { userId, location, notes } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user to verify they exist and are active
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'User account is inactive' }, { status: 400 });
    }

    const now = new Date();
    const cooldownMonths = parseInt(process.env.DONATION_COOLDOWN_MONTHS || '3');
    const availableFrom = calculateAvailableFrom(now, cooldownMonths);

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        userId: user.id,
        donatedAt: now,
        location: location || null,
        notes: notes || null,
      },
    });

    // Update user's last donation and availability
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastDonation: now,
        availableFrom: availableFrom,
      },
      select: {
        id: true,
        name: true,
        bloodGroup: true,
        lastDonation: true,
        availableFrom: true,
      },
    });

    return NextResponse.json({
      message: 'Donation recorded successfully',
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
