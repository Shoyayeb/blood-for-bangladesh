import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get active blood requests from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeRequests = await prisma.bloodRequest.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: [
        { urgency: 'desc' }, // Critical first
        { createdAt: 'desc' }, // Most recent first
      ],
      take: 100, // Limit to 100 most recent requests
    });

    // Format requests for frontend
    const formattedRequests = activeRequests.map(request => ({
      id: request.id,
      requesterName: request.requesterName,
      requesterPhone: request.requesterPhone,
      bloodGroup: request.bloodGroup,
      urgency: request.urgency.toLowerCase(),
      location: request.location,
      hospital: null, // We'll add this when we update the schema
      message: request.message,
      createdAt: request.createdAt.toISOString(),
      requesterCity: request.requesterCity,
      requesterState: request.requesterState,
    }));

    return NextResponse.json({
      requests: formattedRequests,
    });

  } catch (error) {
    console.error('Active requests fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
