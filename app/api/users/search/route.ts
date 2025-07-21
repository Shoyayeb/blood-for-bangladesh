import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { BLOOD_COMPATIBILITY, DonorSearchSchema } from '@/lib/types';
import { isUserAvailable } from '@/lib/utils-donation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authHeader = request.headers.get('Authorization');
    let isAuthenticated = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const verificationResult = await verifyFirebaseToken(token);
      isAuthenticated = verificationResult.success;
    }

    const { searchParams } = new URL(request.url);
    const query = {
      bloodGroup: searchParams.get('bloodGroup') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      area: searchParams.get('area') || undefined,
    };

    // Validate query parameters
    const validatedQuery = DonorSearchSchema.parse(query);

    // Build where clause
    const where: any = {
      isActive: true,
    };

    // Add profile visibility filter based on authentication status
    if (isAuthenticated) {
      // Authenticated users can see all profiles (PUBLIC and PRIVATE)
      where.profileVisibility = {
        in: ['PUBLIC', 'PRIVATE'],
      };
    } else {
      // Non-authenticated users can only see PUBLIC profiles
      where.profileVisibility = 'PUBLIC';
    }

    // Add blood group compatibility filter
    if (validatedQuery.bloodGroup) {
      const compatibleBloodGroups = BLOOD_COMPATIBILITY[validatedQuery.bloodGroup];
      where.bloodGroup = {
        in: compatibleBloodGroups,
      };
    }

    // Add location filters
    if (validatedQuery.city) {
      where.city = {
        contains: validatedQuery.city,
        mode: 'insensitive',
      };
    }

    if (validatedQuery.state) {
      where.state = {
        contains: validatedQuery.state,
        mode: 'insensitive',
      };
    }

    if (validatedQuery.area) {
      where.area = {
        contains: validatedQuery.area,
        mode: 'insensitive',
      };
    }

    // Only show users who are available to donate (past their cooldown period)
    where.OR = [
      { availableFrom: null },
      { availableFrom: { lte: new Date() } },
    ];

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phoneNumber: true, // We'll filter this based on contactVisibility
        bloodGroup: true,
        area: true,
        city: true,
        state: true,
        availableFrom: true,
        contactVisibility: true,
        profileVisibility: true,
        createdAt: true,
      },
      orderBy: [
        { availableFrom: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 50, // Limit results
    });

    // Filter out users who are still in cooldown period and apply contact visibility
    const availableUsers = users
      .filter((user: any) => isUserAvailable(user.availableFrom))
      .map((user: any) => {
        // Determine if contact info should be shown based on privacy settings
        let showContact = false;
        
        if (user.contactVisibility === 'PUBLIC') {
          showContact = true;
        } else if (user.contactVisibility === 'RESTRICTED' && isAuthenticated) {
          showContact = true;
        } else if (user.contactVisibility === 'PRIVATE') {
          showContact = false; // Only the user themselves can see private contact info
        }

        // Return user data with conditional contact info
        const { contactVisibility, profileVisibility, ...userWithoutPrivacyFields } = user;
        
        return {
          ...userWithoutPrivacyFields,
          phoneNumber: showContact ? user.phoneNumber : undefined,
          contactVisible: showContact,
        };
      });

    return NextResponse.json({
      users: availableUsers,
      total: availableUsers.length,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
