import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const { donorId, notes } = await request.json();

    // Get the blood request
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id },
    });

    if (!bloodRequest) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    // Check if the current user is the requester
    if (bloodRequest.userId !== verificationResult.uid) {
      return NextResponse.json({ error: 'Only the requester can mark the request as completed' }, { status: 403 });
    }

    // Check if request is already completed
    if (bloodRequest.status === 'COMPLETED' || bloodRequest.completedAt) {
      return NextResponse.json({ error: 'Request is already completed' }, { status: 400 });
    }

    // Update the request to completed status
    const updatedRequest = await prisma.bloodRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: donorId || null,
      },
    });

    // If a specific donor was mentioned, mark them as having donated
    if (donorId) {
      await prisma.user.update({
        where: { id: donorId },
        data: {
          lastDonationDate: new Date(),
          isDonationPaused: true, // Start 3-month cooldown
        },
      });

      // Create a donation record
      await prisma.donation.create({
        data: {
          userId: donorId,
          location: bloodRequest.location,
          notes: `Donated for blood request: ${bloodRequest.bloodGroup} at ${bloodRequest.location}`,
        },
      });
    }

    return NextResponse.json({
      message: 'Blood request marked as completed successfully',
      request: updatedRequest,
    });

  } catch (error) {
    console.error('Error completing blood request:', error);
    return NextResponse.json(
      { error: 'Failed to complete blood request' },
      { status: 500 }
    );
  }
}
