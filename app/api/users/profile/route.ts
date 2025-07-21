import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { UserUpdateSchema } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    const verificationResult = await verifyFirebaseToken(token);
    
    if (!verificationResult.success) {
      // For development, fall back to query param
      const { searchParams } = new URL(request.url);
      const phoneNumber = searchParams.get('phoneNumber');

      if (!phoneNumber) {
        return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { phoneNumber },
        include: {
          donations: {
            orderBy: { donatedAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        bloodGroup: user.bloodGroup,
        area: user.area,
        city: user.city,
        state: user.state,
        isActive: user.isActive,
        lastDonation: user.lastDonation,
        availableFrom: user.availableFrom,
        contactVisibility: user.contactVisibility,
        profileVisibility: user.profileVisibility,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        donations: user.donations,
      });
    }

    const phoneNumber = verificationResult.phoneNumber;

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        donations: {
          orderBy: { donatedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      bloodGroup: user.bloodGroup,
      area: user.area,
      city: user.city,
      state: user.state,
      isActive: user.isActive,
      lastDonation: user.lastDonation,
      availableFrom: user.availableFrom,
      contactVisibility: user.contactVisibility,
      profileVisibility: user.profileVisibility,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      donations: user.donations,
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const body = await request.json();
    
    // Verify Firebase token
    const verificationResult = await verifyFirebaseToken(token);
    
    if (!verificationResult.success) {
      // For development, allow userId from body
      const { userId, ...updateData } = body;

      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      // Validate update data
      const validatedData = UserUpdateSchema.parse(updateData);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: validatedData,
        select: {
          id: true,
          phoneNumber: true,
          name: true,
          bloodGroup: true,
          area: true,
          city: true,
          state: true,
          isActive: true,
          lastDonation: true,
          availableFrom: true,
          contactVisibility: true,
          profileVisibility: true,
          updatedAt: true,
        },
      });

      return NextResponse.json(updatedUser);
    }

    // If token verification succeeded, get user by phone number
    const phoneNumber = verificationResult.phoneNumber;
    const { userId, ...updateData } = body;

    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate update data
    const validatedData = UserUpdateSchema.parse(updateData);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedData,
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        bloodGroup: true,
        area: true,
        city: true,
        state: true,
        isActive: true,
        lastDonation: true,
        availableFrom: true,
        contactVisibility: true,
        profileVisibility: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
