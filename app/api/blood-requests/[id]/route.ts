import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await context.params;

    if (!requestId) {
      return NextResponse.json(
        { message: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Fetch the blood request details
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        id: true,
        userId: true,
        requesterName: true,
        requesterPhone: true,
        bloodGroup: true,
        urgency: true,
        location: true,
        message: true,
        requesterCity: true,
        requesterState: true,
        hospitalData: true,
        createdAt: true,
        status: true,
        completedAt: true,
        completedBy: true,
      },
    });

    if (!bloodRequest) {
      return NextResponse.json(
        { message: 'Blood request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: bloodRequest,
    });

  } catch (error) {
    console.error('Error fetching blood request details:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
