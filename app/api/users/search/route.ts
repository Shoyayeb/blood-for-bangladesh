import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { BLOOD_COMPATIBILITY, DonorSearchSchema } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for search results (5 minutes TTL)
const searchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(query: Record<string, unknown>, isAuthenticated: boolean, page: number, limit: number): string {
  return JSON.stringify({ query, isAuthenticated, page, limit });
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

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
      zone: searchParams.get('zone') || undefined,
    };

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(10, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // Validate query parameters
    const validatedQuery = DonorSearchSchema.parse(query);

    // Check cache first
    const cacheKey = getCacheKey(validatedQuery, isAuthenticated, page, limit);
    const cachedResult = searchCache.get(cacheKey);
    
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      return NextResponse.json(cachedResult.data);
    }

    // Build where clause
    const where: Record<string, unknown> = {
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

    if (validatedQuery.zone) {
      where.zone = {
        contains: validatedQuery.zone,
        mode: 'insensitive',
      };
    }

    // Only show users who are available to donate (not in donation cooldown)
    where.isDonationPaused = false;

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

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
        zone: true, // Include zone information
        isDonationPaused: true, // Include donation status
        lastDonationDate: true, // Include last donation date
        availableFrom: true, // Keep for backward compatibility
        contactVisibility: true,
        profileVisibility: true,
        createdAt: true,
      },
      orderBy: [
        { availableFrom: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });

    // Filter users and apply contact visibility (no need for additional availability filter since we already filtered in query)
    const availableUsers = users.map((user) => {
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
        const userResponse = {
          id: user.id,
          name: user.name,
          bloodGroup: user.bloodGroup,
          area: user.area,
          city: user.city,
          state: user.state,
          zone: user.zone,
          availableFrom: user.availableFrom,
          createdAt: user.createdAt,
          phoneNumber: showContact ? user.phoneNumber : undefined,
          contactVisible: showContact,
        };
        
        return userResponse;
      });

    const result = {
      users: availableUsers,
      total: availableUsers.length,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
    };

    // Cache the result
    searchCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // Clean up old cache entries (simple LRU)
    if (searchCache.size > 100) {
      const oldestKey = searchCache.keys().next().value;
      searchCache.delete(oldestKey);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
