import { verifyFirebaseToken } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'No token provided',
        message: 'Please provide a valid Firebase token in Authorization header'
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Test Firebase token verification
    const verificationResult = await verifyFirebaseToken(token);
    
    if (verificationResult.success) {
      return NextResponse.json({
        status: 'success',
        message: 'Firebase Admin SDK is working correctly!',
        phoneNumber: verificationResult.phoneNumber,
        uid: verificationResult.uid,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Token verification failed',
        error: verificationResult.error,
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

  } catch (error: any) {
    console.error('Firebase test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Firebase Admin SDK configuration error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
