import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { BLOOD_COMPATIBILITY } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Blood request schema
const BloodRequestSchema = z.object({
  requesterName: z.string().min(2, 'Requester name is required'),
  requesterPhone: z.string().min(10, 'Valid phone number is required'),
  bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().min(5, 'Location is required'),
  message: z.string().optional(),
  notifyRadius: z.number().min(1).max(100),
  notifyAll: z.boolean(),
  requesterCity: z.string(),
  requesterState: z.string(),
});

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
    
    // Validate request data
    const validatedData = BloodRequestSchema.parse(body);

    // Get compatible blood groups for the request
    const compatibleBloodGroups = BLOOD_COMPATIBILITY[validatedData.bloodGroup];

    // Build query filters for finding eligible donors
    const baseFilters = {
      isActive: true,
      bloodGroup: {
        in: compatibleBloodGroups,
      },
      // Only available donors (past cooldown period)
      OR: [
        { availableFrom: null },
        { availableFrom: { lte: new Date() } },
      ],
    };

    // Create additional filters for location if not notifying all
    const locationFilter = !validatedData.notifyAll ? {
      OR: [
        { city: { contains: validatedData.requesterCity, mode: 'insensitive' as const } },
        { state: { contains: validatedData.requesterState, mode: 'insensitive' as const } },
      ],
    } : undefined;

    // Combine filters
    const donorFilters = locationFilter 
      ? { AND: [baseFilters, locationFilter] }
      : baseFilters;

    // Find eligible donors
    const eligibleDonors = await prisma.user.findMany({
      where: donorFilters,
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        bloodGroup: true,
        area: true,
        city: true,
        state: true,
      },
      take: validatedData.notifyAll ? 1000 : 100, // Limit results
    });

    // Create blood request record
    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        requesterName: validatedData.requesterName,
        requesterPhone: validatedData.requesterPhone,
        bloodGroup: validatedData.bloodGroup,
        urgency: validatedData.urgency.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        location: validatedData.location,
        message: validatedData.message,
        notifyRadius: validatedData.notifyRadius,
        notifyAll: validatedData.notifyAll,
        requesterCity: validatedData.requesterCity,
        requesterState: validatedData.requesterState,
        status: 'ACTIVE',
      },
    });

    // In a real application, you would send notifications here
    // For now, we'll simulate notifications by creating notification records
    const notifications = eligibleDonors.map(donor => ({
      bloodRequestId: bloodRequest.id,
      donorId: donor.id,
      sentAt: new Date(),
      status: 'SENT' as const,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    // Log the request for monitoring
    console.log(`Blood request created: ${bloodRequest.id}, notified ${eligibleDonors.length} donors`);

    return NextResponse.json({
      id: bloodRequest.id,
      notifiedCount: eligibleDonors.length,
      urgency: validatedData.urgency,
      bloodGroup: validatedData.bloodGroup,
      message: 'Blood request sent successfully',
    });

  } catch (error: unknown) {
    console.error('Blood request error:', error);
    
    if (error && typeof error === 'object' && 'issues' in error) {
      // Zod validation errors
      const zodError = error as { issues: Array<{ message: string }> };
      const errorMessages = zodError.issues.map((issue) => issue.message).join(', ');
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
