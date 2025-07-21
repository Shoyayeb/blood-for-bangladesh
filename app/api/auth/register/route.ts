import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { UserRegistrationSchema } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    const phoneNumber = verificationResult.phoneNumber;

    // Validate input
    const validatedData = UserRegistrationSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: validatedData.phoneNumber },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        phoneNumber: validatedData.phoneNumber,
        name: validatedData.name,
        bloodGroup: validatedData.bloodGroup,
        area: validatedData.area,
        city: validatedData.city,
        state: validatedData.state,
        isActive: true,
        contactVisibility: validatedData.contactVisibility || 'RESTRICTED',
        profileVisibility: validatedData.profileVisibility || 'PUBLIC',
      },
    });

    return NextResponse.json({ 
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      bloodGroup: user.bloodGroup,
      area: user.area,
      city: user.city,
      state: user.state,
      isActive: user.isActive,
      contactVisibility: user.contactVisibility,
      profileVisibility: user.profileVisibility,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
